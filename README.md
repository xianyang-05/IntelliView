<p align="center">
  <img src="public/images/openhire-logo.png" alt="OpenHire Logo" width="80" />
</p>

<h1 align="center">OpenHire</h1>

<p align="center">
  <strong>AI-Powered HR Portal with Role-Based Access Control</strong>
</p>

<p align="center">
  A full-stack HR management platform combining a modern employee & HR admin portal with an AI chatbot powered by Claude and RAG (Retrieval-Augmented Generation) for intelligent, policy-backed HR assistance.
</p>

---

## ✨ Key Features

### 🧑‍💼 Employee Portal
- **Dashboard** — Personalized home view with quick stats and recent activity
- **Ask HR (AI Chatbot)** — Chat with an AI assistant that answers questions using real company policies and your personal data (leave, salary, contracts)
- **Leave & Requests** — Submit and track leave applications, expense claims, and HR requests
- **Contracts & Equity** — View and digitally sign contracts, track equity vesting
- **Compliance** — Stay up to date with regulatory changes and compliance training
- **Journal** — Personal work journal with reflections and goal tracking
- **Profile** — Manage personal information, emergency contacts, and security settings

### 👔 HR Admin Portal
- **Dashboard** — Organization-wide analytics, headcount trends, recent hires, and quick stats
- **Performance Management** — Review employee performance, create improvement plans, generate reports
- **Contract Generation** — Create, version-control, and manage employment contracts
- **Workflows** — Manage onboarding, offboarding, and HR approval workflows
- **Interview Center** — AI-assisted interview scheduling, evaluation, and offer management
- **Compliance Hub** — Track regulatory updates, assign compliance tasks, and manage audits

### 🤖 AI Chatbot (Three-Tier RBAC)
- **Employee** → Can only query their own data and ask about general policies
- **Manager** → Own data + direct reports' leave, salary, performance, and expenses
- **HR Admin** → Full access to all employee data and company-wide reports
- **RAG-Powered** — Answers are grounded in actual company policy documents indexed in ChromaDB

### 💬 Real-Time Chat
- Unified contact list across employees, HR staff, and managers
- Direct messaging with role-based visibility
- "Request Info" integration from HR workflows

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons, Framer Motion |
| **Authentication** | NextAuth v5 (Credentials + Google OAuth) |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI / LLM** | Anthropic Claude (claude-sonnet-4) |
| **RAG** | ChromaDB for policy document retrieval |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |

---

## 📁 Project Structure

```
openhire/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # API endpoints (auth, chat proxy)
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Main entry point
├── components/
│   ├── employee/           # Employee portal components
│   │   ├── employee-chat.tsx       # AI chatbot interface
│   │   ├── employee-contracts.tsx  # Contract viewer & signing
│   │   ├── employee-requests.tsx   # Leave & expense requests
│   │   ├── employee-compliance.tsx # Compliance dashboard
│   │   └── ...
│   ├── hr/                 # HR admin components
│   │   ├── hr-dashboard.tsx        # HR analytics dashboard
│   │   ├── hr-interview-center.tsx # Interview management
│   │   ├── hr-contract-generation.tsx
│   │   ├── hr-performance-dashboard.tsx
│   │   └── ...
│   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   ├── chat-widget.tsx     # Real-time messaging widget
│   └── hr-employee-portal.tsx  # Main portal shell (routing, sidebar)
├── backend/
│   ├── server.py           # FastAPI backend (chat API, RAG, RBAC)
│   ├── ingest_policies.py  # Policy document ingestion into ChromaDB
│   ├── policies/           # Company policy documents (Markdown)
│   ├── chroma_db/          # ChromaDB vector store
│   └── requirements.txt    # Python dependencies
├── lib/                    # Shared utilities (Supabase client, helpers)
├── auth.ts                 # NextAuth configuration
└── middleware.ts           # Auth middleware
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Supabase** project (with tables: `users`, `employees`, `leave_balances`, `contracts`, `expense_claims`, `performance_reviews`, etc.)

### 1. Clone & Install Frontend

```bash
git clone https://github.com/your-org/openhire.git
cd openhire
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
AUTH_SECRET=your-auth-secret
GOOGLE_CLIENT_ID=your-google-client-id       # Optional: for Google OAuth
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Install & Run Backend

```bash
cd backend
pip install -r requirements.txt
python ingest_policies.py   # Index policy documents into ChromaDB
python server.py            # Starts on http://localhost:8000
```

### 4. Run Frontend

```bash
npm run dev                 # Starts on http://localhost:3000
```

---

## 🔐 Role-Based Access Control

OpenHire implements a three-tier RBAC system enforced at both the **API level** and the **database level** (Supabase RLS):

```
┌─────────────────────────────────────────────┐
│                  HR Admin                    │
│         Full access to all data              │
├─────────────────────────────────────────────┤
│                  Manager                     │
│      Own data + direct reports' data         │
├─────────────────────────────────────────────┤
│                  Employee                    │
│            Own data only                     │
└─────────────────────────────────────────────┘
```

| Capability | Employee | Manager | HR Admin |
|---|:---:|:---:|:---:|
| View own leave/salary/contracts | ✅ | ✅ | ✅ |
| View direct reports' data | ❌ | ✅ | ✅ |
| View any employee's data | ❌ | ❌ | ✅ |
| Company policy questions | ✅ | ✅ | ✅ |
| Team-level summaries | ❌ | ✅ | ✅ |
| Org-wide analytics | ❌ | ❌ | ✅ |

---

## 🧪 Demo Accounts

| Role | Email | Description |
|---|---|---|
| Employee | `alex.chan@openhire.com` | Standard employee with personal data access |
| Manager | `david.wong@openhire.com` | Manager with direct reports |
| HR Admin | `rachel.lim@openhire.com` | Full admin access to all data |

---

## 📄 License

This project is private and proprietary.
