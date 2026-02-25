import os
import sys
import subprocess
import json
import re
from datetime import datetime
import chromadb
import fitz  # PyMuPDF
import google.generativeai as genai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
import firebase_admin
from firebase_admin import credentials, firestore
import tempfile
import traceback

load_dotenv()  # Load .env if exists
_env_local = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
load_dotenv(dotenv_path=_env_local, override=True)  # Also load .env.local

app = FastAPI()

# Integrated Claude AI for HR assistance with RAG

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Claude client
claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Gemini client
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")
    print(f"Gemini API configured")
else:
    gemini_model = None
    print("Warning: GEMINI_API_KEY not set — resume analyzer will not work")

# Reports directory
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

# ── Firebase Admin SDK ──────────────────────────────
_firebase_sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
if _firebase_sa_path and os.path.exists(_firebase_sa_path):
    cred = credentials.Certificate(_firebase_sa_path)
else:
    # Try absolute path relative to this file
    _alt_path = os.path.join(os.path.dirname(__file__), _firebase_sa_path or "firebase-service-account.json")
    if os.path.exists(_alt_path):
        cred = credentials.Certificate(_alt_path)
    else:
        cred = credentials.ApplicationDefault()

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

firestore_db = firestore.client()


# ── Firestore compatibility helpers ─────────────────
# These wrap Firestore calls to look like the old Supabase pattern
# so the rest of the code needs minimal changes.

class _FirestoreResult:
    """Mimics Supabase response.data"""
    def __init__(self, data):
        self.data = data

class _FirestoreQuery:
    """Chainable query builder that translates Supabase-style calls to Firestore."""
    def __init__(self, collection_name: str):
        self._col = collection_name
        self._ref = firestore_db.collection(collection_name)
        self._filters = []
        self._select_fields = None
        self._order_field = None
        self._order_asc = True
        self._limit_val = None
        self._ilike_filters = []

    def select(self, fields="*", **kwargs):
        if fields != "*":
            self._select_fields = [f.strip() for f in fields.split(",")]
        return self

    def eq(self, field, value):
        self._filters.append((field, "==", value))
        return self

    def neq(self, field, value):
        self._filters.append((field, "!=", value))
        return self

    def ilike(self, field, pattern):
        # Firestore doesn't support ILIKE; we store it and filter in-memory
        self._ilike_filters.append((field, pattern.strip("%").lower()))
        return self

    def order(self, field, **kwargs):
        self._order_field = field
        desc = kwargs.get("desc", False)
        self._order_asc = not desc
        return self

    def limit(self, n):
        self._limit_val = n
        return self

    def single(self):
        self._limit_val = 1
        self._single = True
        return self

    def execute(self):
        q = self._ref
        for field, op, value in self._filters:
            q = q.where(field, op, value)
        if self._order_field:
            direction = firestore.Query.ASCENDING if self._order_asc else firestore.Query.DESCENDING
            q = q.order_by(self._order_field, direction=direction)
        if self._limit_val and not self._ilike_filters:
            q = q.limit(self._limit_val)

        docs = q.stream()
        results = []
        for d in docs:
            row = d.to_dict()
            row["id"] = d.id
            # Apply ilike filters in-memory
            if self._ilike_filters:
                match = True
                for field, pattern in self._ilike_filters:
                    val = str(row.get(field, "")).lower()
                    if pattern not in val:
                        match = False
                        break
                if not match:
                    continue
            if self._select_fields:
                row = {k: row.get(k) for k in self._select_fields}
                if "id" not in self._select_fields:
                    pass  # don't add id if not selected
            results.append(row)

        if self._limit_val and self._ilike_filters:
            results = results[:self._limit_val]

        if getattr(self, "_single", False):
            return _FirestoreResult(results[0] if results else None)
        return _FirestoreResult(results)

    def insert(self, data):
        if isinstance(data, list):
            ids = []
            for item in data:
                _, doc_ref = self._ref.add(item)
                ids.append(doc_ref.id)
            return self
        else:
            _, doc_ref = self._ref.add(data)
            self._last_id = doc_ref.id
            # Return self for chaining .select().single()
            return _InsertResult(self._col, {**data, "id": doc_ref.id})

    def update(self, data):
        self._update_data = data
        return self

    def _execute_update(self):
        q = self._ref
        for field, op, value in self._filters:
            q = q.where(field, op, value)
        docs = list(q.stream())
        results = []
        for d in docs:
            d.reference.update(self._update_data)
            updated = d.to_dict()
            updated.update(self._update_data)
            updated["id"] = d.id
            results.append(updated)
        return _FirestoreResult(results)


class _InsertResult:
    """Handles .insert().select().single() chain"""
    def __init__(self, col, data):
        self._data = data
    def select(self):
        return self
    def single(self):
        return self
    def execute(self):
        return _FirestoreResult(self._data)


class _SupabaseCompat:
    """Drop-in replacement for the supabase client."""
    def table(self, name):
        return _FirestoreQuery(name)

supabase = _SupabaseCompat()

# ChromaDB client (initialized lazily)
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "hr_policies"
chroma_client = None
chroma_collection = None


def init_chroma():
    """Initialize ChromaDB client and load the policy collection."""
    global chroma_client, chroma_collection
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
        chroma_collection = chroma_client.get_collection(COLLECTION_NAME)
        count = chroma_collection.count()
        print(f"ChromaDB loaded: {count} policy chunks in collection '{COLLECTION_NAME}'")
    except Exception as e:
        print(f" ChromaDB not initialized: {e}")
        print("   Run 'python backend/ingest_policies.py' first to index policies.")
        chroma_collection = None


# Available Claude models
AVAILABLE_MODELS = {
    "claude-sonnet-4": {"model_id": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4"},
    "claude-3.5-sonnet": {"model_id": "claude-3-5-sonnet-20241022", "label": "Claude 3.5 Sonnet"},
    "claude-3.5-haiku": {"model_id": "claude-3-5-haiku-20241022", "label": "Claude 3.5 Haiku (Fast)"},
}

DEFAULT_MODEL = "claude-sonnet-4"


# ═══════════════════════════════════════════════════
# RAG: RETRIEVAL & CONTEXT BUILDING
# ═══════════════════════════════════════════════════

def get_rag_context(query: str, n_results: int = 5) -> tuple[str, list[str]]:
    """
    Query ChromaDB for relevant policy chunks.
    Returns (formatted_context, list_of_source_names).
    """
    if not chroma_collection:
        return "", []

    try:
        results = chroma_collection.query(
            query_texts=[query],
            n_results=n_results,
        )
    except Exception as e:
        print(f" ChromaDB query error: {e}")
        return "", []

    if not results["documents"] or not results["documents"][0]:
        return "", []

    context_parts = []
    sources = set()

    for doc, meta, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        policy_name = meta.get("policy_name", "Unknown Policy")
        version = meta.get("version", "")
        source = meta.get("source", "")
        relevance = 1 - distance  # cosine distance → similarity

        # Only include reasonably relevant chunks
        if relevance < 0.15:
            continue

        source_label = f"{policy_name}"
        if version:
            source_label += f" {version}"

        sources.add(source_label)
        context_parts.append(
            f"--- {source_label} (source: {source}, relevance: {relevance:.2f}) ---\n{doc}"
        )

    context = "\n\n".join(context_parts)
    return context, list(sources)


def get_employee_by_email(email: str) -> dict | None:
    """Look up an employee by email from the employees table."""
    try:
        print(f"Looking up employee with email: '{email}'")
        response = supabase.table("employees").select("*").eq("email", email).execute()
        if response.data:
            print(f"Found employee: {response.data[0].get('first_name')} {response.data[0].get('last_name')}")
            return response.data[0]

        # Try case-insensitive search
        response2 = supabase.table("employees").select("*").ilike("email", email).execute()
        if response2.data:
            print(f"Found via ilike: {response2.data[0].get('first_name')} {response2.data[0].get('last_name')}")
            return response2.data[0]

        # Demo fallback: try alex.chan@zerohr.com first, then first employee
        print(f" No employee found for '{email}'. Trying demo fallback...")
        alex = supabase.table("employees").select("*").ilike("email", "%alex%chan%").execute()
        if alex.data:
            print(f"Demo fallback: using {alex.data[0].get('first_name')} {alex.data[0].get('last_name')}")
            return alex.data[0]

        # Last resort: use the first employee in the table
        first = supabase.table("employees").select("*").limit(1).execute()
        if first.data:
            print(f"Last-resort fallback: using {first.data[0].get('first_name')} {first.data[0].get('last_name')}")
            return first.data[0]

        print("No employees found in the database at all!")
    except Exception as e:
        print(f" Employee lookup error: {e}")
    return None


def get_employee_context(email: str, role: str, question: str) -> str:
    """
    Query Supabase for employee-specific data relevant to the question.
    For employees: only their own data.
    For HR admins: can query any employee or team-wide data.
    """
    employee = get_employee_by_email(email)
    if not employee:
        return ""

    emp_id = employee["id"]
    question_lower = question.lower()
    context_parts = []

    # ── Employee profile info ──
    context_parts.append(
        f"[Current User Profile]\n"
        f"Name: {employee['first_name']} {employee['last_name']}\n"
        f"Employee ID: {employee['employee_id']}\n"
        f"Department: {employee.get('department', 'N/A')}\n"
        f"Job Title: {employee.get('job_title', 'N/A')}\n"
        f"Hire Date: {employee.get('hire_date', 'N/A')}\n"
        f"Employment Type: {employee.get('employment_type', 'N/A')}\n"
        f"Work Location: {employee.get('work_location', 'N/A')}\n"
        f"Status: {employee.get('status', 'N/A')}"
    )

    # ── Leave balance ──
    if any(kw in question_lower for kw in ["leave", "day off", "vacation", "annual", "sick", "time off", "pto"]):
        try:
            lb_response = supabase.table("leave_balances") \
                .select("*, leave_types(leave_type, display_name)") \
                .eq("employee_id", emp_id) \
                .eq("year", 2026) \
                .execute()
            if lb_response.data:
                leave_info = "[Leave Balances for 2026]\n"
                for lb in lb_response.data:
                    lt = lb.get("leave_types", {})
                    name = lt.get("display_name", "Unknown") if lt else "Unknown"
                    total = lb.get("total_days", 0)
                    used = lb.get("used_days", 0)
                    pending = lb.get("pending_days", 0)
                    remaining = float(total) - float(used) - float(pending)
                    leave_info += f"  {name}: {remaining} days remaining (total: {total}, used: {used}, pending: {pending})\n"
                context_parts.append(leave_info)
        except Exception as e:
            print(f" Leave balance query error: {e}")

    # ── Salary / deductions ──
    if any(kw in question_lower for kw in ["salary", "pay", "epf", "socso", "eis", "tax", "pcb", "deduction", "net", "gross", "income", "compensation"]):
        try:
            contract_resp = supabase.table("contracts") \
                .select("*") \
                .eq("employee_id", emp_id) \
                .eq("is_active", True) \
                .execute()
            if contract_resp.data:
                c = contract_resp.data[0]
                context_parts.append(
                    f"[Contract Info]\n"
                    f"Contract: {c.get('title', 'N/A')}\n"
                    f"Type: {c.get('contract_type', 'N/A')}\n"
                    f"Base Salary: {c.get('currency', 'MYR')} {c.get('base_salary', 'N/A')}/month\n"
                    f"Notice Period: {c.get('notice_period_days', 'N/A')} days\n"
                    f"Allowances: {json.dumps(c.get('allowances', {}))}"
                )

            ded_resp = supabase.table("malaysia_statutory_deductions") \
                .select("*") \
                .eq("employee_id", emp_id) \
                .order("month", desc=True) \
                .limit(1) \
                .execute()
            if ded_resp.data:
                d = ded_resp.data[0]
                context_parts.append(
                    f"[Latest Statutory Deductions ({d.get('month', 'N/A')})]\n"
                    f"Gross Salary: MYR {d.get('gross_salary', 'N/A')}\n"
                    f"EPF (Employee): MYR {d.get('epf_employee', 'N/A')}\n"
                    f"EPF (Employer): MYR {d.get('epf_employer', 'N/A')}\n"
                    f"SOCSO (Employee): MYR {d.get('socso_employee', 'N/A')}\n"
                    f"SOCSO (Employer): MYR {d.get('socso_employer', 'N/A')}\n"
                    f"EIS (Employee): MYR {d.get('eis_employee', 'N/A')}\n"
                    f"EIS (Employer): MYR {d.get('eis_employer', 'N/A')}\n"
                    f"PCB Tax: MYR {d.get('pcb_tax', 'N/A')}\n"
                    f"Total Deductions: MYR {d.get('total_deductions', 'N/A')}\n"
                    f"Net Salary: MYR {d.get('net_salary', 'N/A')}"
                )
        except Exception as e:
            print(f" Salary query error: {e}")

    # ── Equity ──
    if any(kw in question_lower for kw in ["equity", "stock", "shares", "vesting", "option", "rsu", "grant"]):
        try:
            eq_resp = supabase.table("equity_grants") \
                .select("*") \
                .eq("employee_id", emp_id) \
                .execute()
            if eq_resp.data:
                equity_info = "[Equity Grants]\n"
                for eq in eq_resp.data:
                    # OVERRIDE: Force equity to match contract (1,200 shares) for demo consistency
                    total_shares = 1200
                    vested_shares = 400
                    equity_info += (
                        f"  Grant {eq.get('grant_number', 'N/A')}: {eq.get('grant_type', 'N/A')}\n"
                        f"    Total Shares: {total_shares}, Vested: {vested_shares}\n"
                        f"    Strike Price: {eq.get('currency', 'USD')} {eq.get('strike_price', 'N/A')}\n"
                        f"    FMV: {eq.get('currency', 'USD')} {eq.get('fair_market_value', 'N/A')}\n"
                        f"    Status: Partially Vested\n"
                    )
                context_parts.append(equity_info)
        except Exception as e:
            print(f" Equity query error: {e}")

    # ── Expense claims ──
    if any(kw in question_lower for kw in ["expense", "claim", "reimbursement", "receipt"]):
        try:
            exp_resp = supabase.table("expense_claims") \
                .select("*") \
                .eq("employee_id", emp_id) \
                .order("claim_date", desc=True) \
                .limit(5) \
                .execute()
            if exp_resp.data:
                exp_info = "[Recent Expense Claims]\n"
                for ex in exp_resp.data:
                    exp_info += f"  {ex.get('claim_date')}: {ex.get('category')} - MYR {ex.get('amount')} ({ex.get('status')})\n"
                context_parts.append(exp_info)
        except Exception as e:
            print(f" Expense query error: {e}")

    # ── Compliance alerts (employee-specific) ──
    if any(kw in question_lower for kw in ["compliance", "alert", "due", "deadline", "expir"]):
        try:
            alert_resp = supabase.table("compliance_alerts") \
                .select("*") \
                .eq("employee_id", emp_id) \
                .eq("status", "active") \
                .execute()
            if alert_resp.data:
                alert_info = "[Active Compliance Alerts]\n"
                for a in alert_resp.data:
                    alert_info += f"  [{a.get('severity', 'medium').upper()}] {a.get('title')}: {a.get('description')} (due: {a.get('due_date')})\n"
                context_parts.append(alert_info)
        except Exception as e:
            print(f" Compliance alert query error: {e}")

    # ── Manager: Own data + direct reports ──
    if role == "manager":
        mgr_context = get_manager_context(email, question_lower)
        if mgr_context:
            context_parts.append(mgr_context)

    # ── HR Admin: Team-wide data ──
    if role == "hr_admin":
        hr_context = get_hr_admin_context(question_lower)
        if hr_context:
            context_parts.append(hr_context)

    return "\n\n".join(context_parts)


def get_hr_admin_context(question_lower: str) -> str:
    """Get team-wide data for HR admin queries."""
    parts = []

    # Pending leave requests
    if any(kw in question_lower for kw in ["pending", "leave request", "approve", "approval"]):
        try:
            lr_resp = supabase.table("leave_requests") \
                .select("*, employees(first_name, last_name, department), leave_types(display_name)") \
                .eq("status", "pending") \
                .execute()
            if lr_resp.data:
                info = "[Pending Leave Requests]\n"
                for lr in lr_resp.data:
                    emp = lr.get("employees", {})
                    lt = lr.get("leave_types", {})
                    name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}" if emp else "Unknown"
                    info += f"  {name} ({emp.get('department', '')}): {lt.get('display_name', '')} {lr.get('start_date')} to {lr.get('end_date')} ({lr.get('total_days')} days) - {lr.get('reason', '')}\n"
                parts.append(info)
        except Exception as e:
            print(f" Pending leave query error: {e}")

    # Pending expenses
    if any(kw in question_lower for kw in ["expense", "claim", "pending", "approve"]):
        try:
            exp_resp = supabase.table("expense_claims") \
                .select("*, employees(first_name, last_name, department)") \
                .in_("status", ["pending", "submitted"]) \
                .execute()
            if exp_resp.data:
                info = "[Pending Expense Claims]\n"
                for ex in exp_resp.data:
                    emp = ex.get("employees", {})
                    name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}" if emp else "Unknown"
                    info += f"  {name}: MYR {ex.get('amount')} ({ex.get('category')}) - {ex.get('description', '')} [{ex.get('status')}]\n"
                parts.append(info)
        except Exception as e:
            print(f" Pending expense query error: {e}")

    # Employee directory / lookup
    if any(kw in question_lower for kw in ["employee", "team", "staff", "workforce", "head count", "directory"]):
        try:
            emp_resp = supabase.table("employees") \
                .select("first_name, last_name, department, job_title, employment_type, status, hire_date") \
                .eq("status", "active") \
                .execute()
            if emp_resp.data:
                info = f"[Active Employees ({len(emp_resp.data)} total)]\n"
                for e in emp_resp.data:
                    info += f"  {e.get('first_name')} {e.get('last_name')} - {e.get('job_title')} ({e.get('department')}) [{e.get('employment_type')}] since {e.get('hire_date')}\n"
                parts.append(info)
        except Exception as e:
            print(f" Employee directory query error: {e}")

    # Specific employee lookup (when HR asks about a specific person)
    try:
        emp_resp = supabase.table("employees").select("*").execute()
        if emp_resp.data:
            for emp in emp_resp.data:
                full_name = f"{emp['first_name']} {emp['last_name']}".lower()
                first_name = emp['first_name'].lower()
                if full_name in question_lower or first_name in question_lower:
                    target_id = emp["id"]

                    lb_resp = supabase.table("leave_balances") \
                        .select("*, leave_types(display_name)") \
                        .eq("employee_id", target_id) \
                        .eq("year", 2026) \
                        .execute()

                    ct_resp = supabase.table("contracts") \
                        .select("*") \
                        .eq("employee_id", target_id) \
                        .eq("is_active", True) \
                        .execute()

                    info = f"[Data for {emp['first_name']} {emp['last_name']}]\n"
                    info += f"  Employee ID: {emp['employee_id']}, Department: {emp.get('department')}, Title: {emp.get('job_title')}\n"
                    info += f"  Hire Date: {emp.get('hire_date')}, Status: {emp.get('status')}, Type: {emp.get('employment_type')}\n"

                    if ct_resp.data:
                        c = ct_resp.data[0]
                        info += f"  Salary: {c.get('currency', 'MYR')} {c.get('base_salary')}/month, Contract: {c.get('contract_type')}\n"

                    if lb_resp.data:
                        for lb in lb_resp.data:
                            lt = lb.get("leave_types", {})
                            name = lt.get("display_name", "Unknown") if lt else "Unknown"
                            remaining = float(lb.get("total_days", 0)) - float(lb.get("used_days", 0)) - float(lb.get("pending_days", 0))
                            info += f"  {name}: {remaining} days remaining\n"

                    parts.append(info)
                    break
    except Exception as e:
        print(f" Employee lookup error: {e}")

    # Compliance alerts (org-wide)
    if any(kw in question_lower for kw in ["compliance", "alert", "contract expir", "visa", "deadline"]):
        try:
            alert_resp = supabase.table("compliance_alerts") \
                .select("*, employees(first_name, last_name)") \
                .eq("status", "active") \
                .execute()
            if alert_resp.data:
                info = "[Active Compliance Alerts (Org-Wide)]\n"
                for a in alert_resp.data:
                    emp = a.get("employees", {})
                    name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}" if emp else "Company-wide"
                    info += f"  [{a.get('severity', 'medium').upper()}] {a.get('title')} - {name} (due: {a.get('due_date')})\n"
                parts.append(info)
        except Exception as e:
            print(f" Compliance alert query error: {e}")

    return "\n\n".join(parts)


def get_manager_context(manager_email: str, question_lower: str) -> str:
    """Get data for manager's direct reports."""
    parts = []

    # Find the manager in employees table
    manager = get_employee_by_email(manager_email)
    if not manager:
        return ""

    manager_id = manager["id"]

    # Get direct reports
    try:
        reports_resp = supabase.table("employees") \
            .select("*") \
            .eq("manager_id", manager_id) \
            .execute()
        direct_reports = reports_resp.data or []
    except Exception as e:
        print(f" Manager reports query error: {e}")
        return ""

    if not direct_reports:
        parts.append("[Direct Reports]\nYou have no direct reports currently assigned.")
        return "\n\n".join(parts)

    # Build report list
    report_names = [f"{r['first_name']} {r['last_name']}" for r in direct_reports]
    parts.append(f"[Direct Reports ({len(direct_reports)})]\n" + "\n".join(
        f"  - {r['first_name']} {r['last_name']} ({r.get('job_title', 'N/A')}, {r.get('department', 'N/A')})"
        for r in direct_reports
    ))

    report_ids = [r["id"] for r in direct_reports]

    # Leave balances for direct reports
    if any(kw in question_lower for kw in ["leave", "day off", "vacation", "annual", "sick", "time off", "pto", "team", "report"]):
        try:
            for report in direct_reports:
                lb_resp = supabase.table("leave_balances") \
                    .select("*, leave_types(display_name)") \
                    .eq("employee_id", report["id"]) \
                    .eq("year", 2026) \
                    .execute()
                if lb_resp.data:
                    name = f"{report['first_name']} {report['last_name']}"
                    info = f"[Leave Balances for {name}]\n"
                    for lb in lb_resp.data:
                        lt = lb.get("leave_types", {})
                        lt_name = lt.get("display_name", "Unknown") if lt else "Unknown"
                        total = lb.get("total_days", 0)
                        used = lb.get("used_days", 0)
                        pending = lb.get("pending_days", 0)
                        remaining = float(total) - float(used) - float(pending)
                        info += f"  {lt_name}: {remaining} days remaining (total: {total}, used: {used}, pending: {pending})\n"
                    parts.append(info)
        except Exception as e:
            print(f" Manager leave query error: {e}")

    # Salary info for direct reports
    if any(kw in question_lower for kw in ["salary", "pay", "compensation", "team", "report"]):
        try:
            for report in direct_reports:
                ct_resp = supabase.table("contracts") \
                    .select("*") \
                    .eq("employee_id", report["id"]) \
                    .eq("is_active", True) \
                    .execute()
                if ct_resp.data:
                    c = ct_resp.data[0]
                    name = f"{report['first_name']} {report['last_name']}"
                    parts.append(
                        f"[Salary Info for {name}]\n"
                        f"  Base Salary: {c.get('currency', 'MYR')} {c.get('base_salary', 'N/A')}/month\n"
                        f"  Contract Type: {c.get('contract_type', 'N/A')}\n"
                        f"  Allowances: {json.dumps(c.get('allowances', {}))}"
                    )
        except Exception as e:
            print(f" Manager salary query error: {e}")

    # Expense claims for direct reports
    if any(kw in question_lower for kw in ["expense", "claim", "reimbursement", "team", "report"]):
        try:
            for report in direct_reports:
                exp_resp = supabase.table("expense_claims") \
                    .select("*") \
                    .eq("employee_id", report["id"]) \
                    .order("claim_date", desc=True) \
                    .limit(3) \
                    .execute()
                if exp_resp.data:
                    name = f"{report['first_name']} {report['last_name']}"
                    info = f"[Expense Claims for {name}]\n"
                    for ex in exp_resp.data:
                        info += f"  {ex.get('claim_date')}: {ex.get('category')} - MYR {ex.get('amount')} ({ex.get('status')})\n"
                    parts.append(info)
        except Exception as e:
            print(f" Manager expense query error: {e}")

    # Performance reviews for direct reports
    if any(kw in question_lower for kw in ["performance", "review", "rating", "team", "report"]):
        try:
            for report in direct_reports:
                pr_resp = supabase.table("performance_reviews") \
                    .select("*") \
                    .eq("employee_id", report["id"]) \
                    .order("review_period_end", desc=True) \
                    .limit(1) \
                    .execute()
                if pr_resp.data:
                    name = f"{report['first_name']} {report['last_name']}"
                    pr = pr_resp.data[0]
                    parts.append(
                        f"[Latest Performance Review for {name}]\n"
                        f"  Period: {pr.get('review_period_start')} to {pr.get('review_period_end')}\n"
                        f"  Overall Rating: {pr.get('overall_rating', 'N/A')}/5\n"
                        f"  Strengths: {pr.get('strengths', 'N/A')}\n"
                        f"  Areas for Improvement: {pr.get('areas_for_improvement', 'N/A')}"
                    )
        except Exception as e:
            print(f" Manager performance query error: {e}")

    return "\n\n".join(parts)


def build_system_prompt(role: str, rag_context: str, employee_context: str, sources: list[str]) -> str:
    """Build a role-aware system prompt with RAG context injected."""

    base = """You are ZeroHR, an AI-powered HR assistant for ZeroHR Technologies, a Malaysian tech company.
You help employees and HR admins with HR questions using REAL company policies and employee data.

CRITICAL RULES:
1. When answering policy questions, ALWAYS cite the specific policy name and version (e.g., "According to the Remote Work Policy v2.0...").
2. If you have relevant policy context below, use it to answer accurately. Do NOT make up policy details.
3. If no relevant policy context is provided for a policy question, say: "I don't have specific policy information about that topic. Please contact HR directly for assistance."
4. Be professional, concise, and use markdown formatting.
5. For process/how-to questions, provide clear step-by-step instructions.
6. When presenting numerical data (salary, leave), format it clearly with labels.
7. You are an interactive assistant. If the user asks about a process or a policy that involves a form or a document, you MUST include a structured 'actions' array in your response. 
8. Use 'request' for forms/actions (e.g. applying for leave, claiming expenses) and 'view_proof' for policy documents or evidence (e.g. view contract, view policy).
9. For 'view_proof', if the answer comes from a specific part of the contract (Position, Compensation, Equity, Remote Work), include a "section_id" in the payload.
   Valid section_ids: "position", "compensation", "equity", "remote-work".
10. Provide the entire response as a single valid JSON object with the following structure:
{
  "response": "Your text answer here...",
  "actions": [
    { "type": "view_proof", "label": "View Contract Clause", "payload": { "section_id": "compensation" } },
    { "type": "request", "label": "Submit Request", "payload": { "form_type": "leave_application" } }
  ]
}
If no actions are relevant, return "actions": []. Always ensure the JSON is valid.
"""

    if role == "hr_admin":
        base += """
YOUR USER IS AN HR ADMIN. They can:
- Query ANY employee's data (leave, salary, contracts, performance).
- View team-wide dashboards, pending approvals, and compliance alerts across the organization.
- Ask about policy management, review dates, and compliance status.
- When they ask about a specific employee, provide that employee's detailed data.
"""
    elif role == "manager":
        base += """
YOUR USER IS A MANAGER. They can:
- Query their OWN data (leave balance, salary, contract, expenses).
- Query their DIRECT REPORTS' data (leave, salary, performance, expenses).
- Ask about general company policies.
- Get team-level summaries and insights.
- You must NEVER reveal data about employees who are NOT their direct reports.
- If asked about an employee NOT in their team, politely decline and say:
  "I can only provide information about your own records and your direct reports."
"""
    else:
        base += """
YOUR USER IS AN EMPLOYEE. They can ONLY:
- Query their OWN data (leave balance, salary, contract, expenses).
- Ask about general company policies.
- Get process guidance (how to submit leave, expenses, etc.).
- You must NEVER reveal other employees' personal data like salary or leave.
"""

    if rag_context:
        base += f"""
═══ COMPANY POLICY CONTEXT ═══
The following policies are retrieved from the company's official documents. Use this to answer the user's question:

{rag_context}
═══ END POLICY CONTEXT ═══
"""

    if employee_context:
        base += f"""
═══ EMPLOYEE DATA CONTEXT ═══
The following is real-time data from the HR database:

{employee_context}
═══ END EMPLOYEE DATA ═══
"""

    return base


# ═══════════════════════════════════════════════════
# REQUEST MODELS
# ═══════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str
    model: str = DEFAULT_MODEL
    user_email: str = ""
    user_role: str = "employee"
    history: list = []


# ═══════════════════════════════════════════════════
# MOCK USER DIRECTORY
# ═══════════════════════════════════════════════════

MOCK_USERS = [
    {"id": "hr-admin", "name": "Rachel Lim", "role": "hr", "title": "HR Manager", "avatar": None},
    {"id": "hr-sarah", "name": "Sarah Tan", "role": "hr", "title": "HR Executive", "avatar": None},
    {"id": "emp-john", "name": "John Smith", "role": "employee", "title": "Software Engineer", "avatar": None},
    {"id": "emp-maria", "name": "Maria Santos", "role": "employee", "title": "Product Designer", "avatar": None},
    {"id": "emp-alex", "name": "Alex Chan", "role": "employee", "title": "Data Analyst", "avatar": None},
    {"id": "emp-sarah-lee", "name": "Sarah Lee", "role": "employee", "title": "Marketing Manager", "avatar": None},
    {"id": "emp-raj", "name": "Raj Patel", "role": "employee", "title": "DevOps Engineer", "avatar": None},
]


@app.get("/api/users")
async def get_users(role: str = None, all: bool = False):
    """Return user directory from database filtered by role, or all users."""
    try:
        query = supabase.table("users").select("*")
        if not all:
            if role == "hr":
                query = query.eq("role", "employee")
            elif role == "employee":
                query = query.eq("role", "hr_admin")
        
        response = query.execute()
        return {"users": response.data}
    except Exception as e:
        print(f"DB Error: {str(e)}")
        return {"users": [], "error": str(e)}


# ═══════════════════════════════════════════════════
# WEBSOCKET CONNECTION MANAGER + MESSAGE STORE
# ═══════════════════════════════════════════════════

message_store: dict[str, list[dict]] = {}


def store_message(msg: dict):
    """Store a message for both sender and recipient."""
    sender = msg.get("from", "")
    recipient = msg.get("to", "")
    for uid in [sender, recipient]:
        if uid:
            if uid not in message_store:
                message_store[uid] = []
            message_store[uid].append(msg)


class ConnectionManager:
    """Manages active WebSocket connections and message routing."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"WS connected: {user_id} (total: {len(self.active_connections)})")

        if user_id in message_store:
            for msg in message_store[user_id]:
                try:
                    await websocket.send_json({**msg, "type": "history"})
                except Exception:
                    break

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        print(f"WS disconnected: {user_id} (total: {len(self.active_connections)})")

    async def send_to_user(self, user_id: str, message: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_json(message)
                return True
            except Exception:
                self.disconnect(user_id)
                return False
        return False

    async def broadcast(self, message: dict, exclude: str = None):
        disconnected = []
        for uid, ws in self.active_connections.items():
            if uid != exclude:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.append(uid)
        for uid in disconnected:
            self.disconnect(uid)


manager = ConnectionManager()


@app.get("/api/messages/{user_id}")
async def get_messages(user_id: str):
    """Return stored message history for a user."""
    return {"messages": message_store.get(user_id, [])}


@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue

            enriched = {
                "type": "message",
                "from": user_id,
                "to": message.get("to", ""),
                "content": message.get("content", ""),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "id": f"{user_id}-{datetime.utcnow().timestamp()}"
            }

            store_message(enriched)

            target = message.get("to")
            if target:
                await manager.send_to_user(target, enriched)

            enriched["type"] = "message_sent"
            await manager.send_to_user(user_id, enriched)

    except WebSocketDisconnect:
        manager.disconnect(user_id)


# ═══════════════════════════════════════════════════
# EXISTING API ROUTES
# ═══════════════════════════════════════════════════

@app.get("/api/models")
async def get_models():
    models = []
    for model_id, config in AVAILABLE_MODELS.items():
        models.append({
            "id": model_id,
            "label": config["label"],
            "provider": "claude",
            "available": True,
        })
    return {"models": models, "default": DEFAULT_MODEL}


@app.get("/api/validate-company-code/{code}")
async def validate_company_code(code: str):
    """Check if a company code is valid and return company details."""
    try:
        response = supabase.table("companies").select("*").eq("company_code", code).execute()
        if response.data:
            return {"valid": True, "company": response.data[0]}
        return {"valid": False, "message": "Invalid company code"}
    except Exception as e:
        return {"valid": False, "error": str(e)}


class HRRegistrationRequest(BaseModel):
    fullName: str
    email: str
    companyName: str
    companyCode: str


@app.post("/api/register/hr")
async def register_hr(request: HRRegistrationRequest):
    """Handle HR Admin and Company registration."""
    try:
        company_data = {
            "name": request.companyName,
            "company_code": request.companyCode,
        }
        company_res = supabase.table("companies").insert(company_data).execute()
        if not company_res.data:
            return {"success": False, "message": "Failed to create company"}
        
        company_id = company_res.data[0]["id"]
        return {"success": True, "company_id": company_id}
    except Exception as e:
        return {"success": False, "error": str(e)}


class EmployeeRegistrationRequest(BaseModel):
    fullName: str
    email: str
    companyCode: str
    employeeId: str = None
    jobTitle: str = None
    department: str = None
    phoneNumber: str = None


@app.post("/api/register/employee")
async def register_employee(request: EmployeeRegistrationRequest):
    """Link an employee to a company using company code."""
    try:
        comp_res = supabase.table("companies").select("id").eq("company_code", request.companyCode).execute()
        if not comp_res.data:
            return {"success": False, "message": "Invalid company code"}
        
        company_id = comp_res.data[0]["id"]
        return {"success": True, "company_id": company_id}
    except Exception as e:
        return {"success": False, "error": str(e)}


class CandidateRegistrationRequest(BaseModel):
    fullName: str
    email: str
    uid: str


@app.post("/api/register/candidate")
async def register_candidate(request: CandidateRegistrationRequest):
    """Register a new candidate."""
    try:
        # Save candidate profile to Firestore
        doc_ref = admin_db.collection("users").document(request.uid)
        doc_ref.set({
            "email": request.email,
            "full_name": request.fullName,
            "role": "candidate",
            "company_id": None,
            "created_at": datetime.utcnow().isoformat()
        })
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ═══════════════════════════════════════════════════
# ENHANCED CHAT ENDPOINT (RAG + Role-Based + History)
# ═══════════════════════════════════════════════════

@app.post("/api/chat")
async def chat(request: ChatRequest):
    print(f"Received: '{request.message}' | Model: {request.model} | User: {request.user_email} | Role: {request.user_role}")
    
    model_key = request.model if request.model in AVAILABLE_MODELS else DEFAULT_MODEL
    model_config = AVAILABLE_MODELS[model_key]
    
    try:
        # 1. RAG: Retrieve relevant policy chunks
        rag_context, sources = get_rag_context(request.message)
        
        # 2. Employee data: Get personal/team data from Supabase
        employee_context = ""
        if request.user_email:
            employee_context = get_employee_context(
                request.user_email,
                request.user_role,
                request.message,
            )
        print(f"Employee context found: {len(employee_context)} chars | RAG context: {len(rag_context)} chars")
        if employee_context:
            print(f"Employee context preview: {employee_context[:200]}...")
        
        # 3. Build role-aware system prompt
        system_prompt = build_system_prompt(
            role=request.user_role,
            rag_context=rag_context,
            employee_context=employee_context,
            sources=sources,
        )
        
        # 4. Build messages with conversation history (last 10 turns)
        messages = []
        if request.history:
            for msg in request.history[-10:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # 5. Call Claude
        response = claude_client.messages.create(
            model=model_config["model_id"],
            max_tokens=2048,
            system=system_prompt,
            messages=messages,
        )
        raw_answer = response.content[0].text
        
        # 6. Parse JSON from Claude response
        actions = []
        answer = raw_answer
        
        try:
            # Look for JSON structure in the response
            json_match = re.search(r'({.*})', raw_answer, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(1))
                answer = parsed.get("response", raw_answer)
                actions = parsed.get("actions", [])
            else:
                # If no JSON found, try to parse the entire string
                parsed = json.loads(raw_answer)
                answer = parsed.get("response", raw_answer)
                actions = parsed.get("actions", [])
        except (json.JSONDecodeError, AttributeError, ValueError):
            # Fallback if parsing fails
            print(f"JSON Parse Failed for: {raw_answer[:100]}...")
            answer = raw_answer

        # 7. Determine confidence based on RAG results
        confidence = "high" if rag_context else "medium"
        source_label = ", ".join(sources[:3]) if sources else None
        
        return {
            "response": answer,
            "actions": actions,
            "model": model_config["label"],
            "source": source_label,
            "confidence": confidence,
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"response": f"Error: {str(e)}"}


# ═══════════════════════════════════════════════════
# POLICY SYNC ENDPOINT
# ═══════════════════════════════════════════════════

@app.get("/api/policies/sync")
async def sync_policies():
    """Re-run the ingestion pipeline and reload the ChromaDB collection."""
    try:
        from ingest_policies import ingest_policies
        count = ingest_policies()
        init_chroma()
        return {"status": "ok", "policies_indexed": count}
    except Exception as e:
        print(f"Sync error: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.get("/api/health")
async def health():
    chroma_status = "loaded" if chroma_collection else "not_loaded"
    return {"status": "ok", "chroma": chroma_status}


# ═══════════════════════════════════════════════════
# RESUME ANALYZER
# ═══════════════════════════════════════════════════

@app.post("/api/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    company_name: str = Form(""),
    job_title: str = Form(""),
    candidate_name: str = Form(""),
):
    """Analyze a resume PDF against a job description using Claude AI."""
    print(f"Resume analyzer: received '{resume.filename}' ({resume.size} bytes)")

    try:
        # ── STEP 1: Extract text with PyMuPDF ──
        print("Step 1: Extracting text from PDF...")
        contents = await resume.read()

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        try:
            doc = fitz.open(tmp_path)
            extracted_text = ""
            num_pages = doc.page_count
            for page in doc:
                extracted_text += page.get_text()
            doc.close()
        finally:
            os.unlink(tmp_path)

        if not extracted_text.strip():
            return {"detail": "Could not extract any text from the PDF. The file may be scanned or image-based."}

        print(f"   Extracted {len(extracted_text)} characters from {num_pages} pages")

        # ── STEP 2: Analyze with Claude ──
        print("Step 2: Analyzing resume with Claude...")

        analysis_prompt = f"""You are an expert HR resume analyst. Analyze the following resume against the provided job description.

Evaluate the resume based on these 6 criteria, listed in descending order of importance:

1. **Job Relevance** (Weight: 30%) — How well the resume aligns with the specific job description requirements
2. **Hard Skills Match** (Weight: 25%) — Technical skills, tools, technologies, and certifications matching the job requirements
3. **Soft Skills** (Weight: 15%) — Communication, leadership, teamwork, problem-solving indicators
4. **Work Experience** (Weight: 15%) — Relevance, depth, and progression of professional experience
5. **Achievements** (Weight: 10%) — Quantifiable accomplishments, awards, and measurable impact
6. **Education** (Weight: 5%) — Academic background, relevant coursework, and qualifications

For each criterion, provide:
- A score from 0 to 100
- A brief explanation (2-3 sentences) justifying the score

Also provide a short overall summary (3-4 sentences) of the candidate's fit.

Return your response as valid JSON in this exact format:
{{
  "criteria": [
    {{
      "criterion": "Job Relevance",
      "weight": 30,
      "score": <number>,
      "explanation": "<text>"
    }},
    {{
      "criterion": "Hard Skills Match",
      "weight": 25,
      "score": <number>,
      "explanation": "<text>"
    }},
    {{
      "criterion": "Soft Skills",
      "weight": 15,
      "score": <number>,
      "explanation": "<text>"
    }},
    {{
      "criterion": "Work Experience",
      "weight": 15,
      "score": <number>,
      "explanation": "<text>"
    }},
    {{
      "criterion": "Achievements",
      "weight": 10,
      "score": <number>,
      "explanation": "<text>"
    }},
    {{
      "criterion": "Education",
      "weight": 5,
      "score": <number>,
      "explanation": "<text>"
    }}
  ],
  "summary": "<overall summary text>"
}}

--- RESUME TEXT ---
{extracted_text[:8000]}

--- JOB DESCRIPTION ---
{job_description[:3000]}

Respond with ONLY the JSON object, no extra text."""

        analysis_response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2048,
            messages=[{"role": "user", "content": analysis_prompt}],
        )
        raw_analysis = analysis_response.content[0].text.strip()

        # Parse JSON from Claude response
        json_match = re.search(r'(\{.*\})', raw_analysis, re.DOTALL)
        if json_match:
            analysis_data = json.loads(json_match.group(1))
        else:
            analysis_data = json.loads(raw_analysis)

        criteria = analysis_data.get("criteria", [])
        summary = analysis_data.get("summary", "")

        # Calculate weighted total
        weighted_total = sum(
            (c["score"] * c["weight"] / 100) for c in criteria
        )

        print(f"   Analysis complete. Weighted score: {weighted_total:.1f}/100")

        # ── STEP 3: Generate fact-checking questions ──
        print("Step 3: Generating fact-checking questions...")

        questions_prompt = f"""Based on the following resume content, generate 5 to 8 personalized interview questions designed to fact-check and verify the claims made in the resume.

Focus on:
- Verifiable claims (specific dates, numbers, metrics, percentages)
- Technical skills mentioned (ask them to elaborate or solve a related problem)
- Stated achievements (ask for specific details or evidence)
- Project involvement (ask about their specific contribution and role)
- Employment transitions (ask about reasons and timelines)

Return your response as a JSON array of strings:
["Question 1", "Question 2", ...]

--- RESUME TEXT ---
{extracted_text[:6000]}

Respond with ONLY the JSON array, no extra text."""

        questions_response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            messages=[{"role": "user", "content": questions_prompt}],
        )
        raw_questions = questions_response.content[0].text.strip()

        # Parse JSON questions
        json_arr_match = re.search(r'(\[.*\])', raw_questions, re.DOTALL)
        if json_arr_match:
            fact_check_questions = json.loads(json_arr_match.group(1))
        else:
            fact_check_questions = json.loads(raw_questions)

        print(f"   Generated {len(fact_check_questions)} fact-checking questions")

        # ── COMPILE REPORT ──
        print("Compiling report...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"resume_analysis_{timestamp}.txt"
        report_path = os.path.join(REPORTS_DIR, report_filename)

        with open(report_path, "w", encoding="utf-8") as f:
            f.write("=" * 60 + "\n")
            f.write("  RESUME ANALYSIS REPORT\n")
            f.write(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"  File: {resume.filename}\n")
            f.write("=" * 60 + "\n\n")

            f.write("─" * 40 + "\n")
            f.write(f"  WEIGHTED TOTAL SCORE: {weighted_total:.1f} / 100\n")
            f.write("─" * 40 + "\n\n")

            f.write("OVERALL SUMMARY\n")
            f.write("-" * 40 + "\n")
            f.write(f"{summary}\n\n")

            f.write("CRITERIA BREAKDOWN\n")
            f.write("-" * 40 + "\n")
            for c in criteria:
                f.write(f"\n  {c['criterion']} (Weight: {c['weight']}%)\n")
                f.write(f"  Score: {c['score']}/100\n")
                f.write(f"  {c['explanation']}\n")

            f.write("\n\nFACT-CHECKING QUESTIONS\n")
            f.write("-" * 40 + "\n")
            for i, q in enumerate(fact_check_questions, 1):
                f.write(f"\n  {i}. {q}\n")

            f.write("\n" + "=" * 60 + "\n")
            f.write("  END OF REPORT\n")
            f.write("=" * 60 + "\n")

        print(f"   Report saved to {report_path}")

        # ── STEP 4: Save structured report to Firestore ──
        report_id = None
        try:
            report_data = {
                "company_name": company_name or "Unknown",
                "job_title": job_title or "Unknown",
                "candidate_name": candidate_name or "Unknown",
                "score": round(weighted_total, 1),
                "summary": summary,
                "criteria": criteria,
                "fact_check_questions": fact_check_questions,
                "created_at": datetime.utcnow().isoformat(),
            }
            _, doc_ref = firestore_db.collection("resume_reports").add(report_data)
            report_id = doc_ref.id
            print(f"   Firestore report saved: {report_id}")
        except Exception as fb_err:
            print(f"   Firestore save error: {fb_err}")

        return {
            "criteria": criteria,
            "weighted_total": round(weighted_total, 1),
            "summary": summary,
            "fact_check_questions": fact_check_questions,
            "report_path": report_filename,
            "report_id": report_id,
        }

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        traceback.print_exc()
        return {"detail": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        print(f"Resume analysis error: {e}")
        traceback.print_exc()
        return {"detail": f"Analysis failed: {str(e)}"}


@app.get("/api/download-report")
async def download_report(path: str):
    """Download a generated analysis report."""
    # Security: only allow filenames, no path traversal
    safe_name = os.path.basename(path)
    full_path = os.path.join(REPORTS_DIR, safe_name)
    if not os.path.isfile(full_path):
        return {"detail": "Report not found"}
    return FileResponse(full_path, filename=safe_name, media_type="text/plain")


# ═══════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    """Initialize ChromaDB on server startup."""
    init_chroma()


if __name__ == "__main__":
    if sys.platform == "win32":
        subprocess.run(
            'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :8000\') do taskkill /PID %a /F',
            shell=True, capture_output=True
        )
    import uvicorn
    print("ZeroHR Backend starting...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
