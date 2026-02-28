from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import math

class CompanyProfilingRequest(BaseModel):
    budget: float
    industry: str
    stage: str
    company_description: str
    selected_positions: List[str]
    company_name: str
    company_code: str
    employees: List[Dict[str, Any]] = []

# Step 1: Ratio Calculation
DEFAULT_ROLES = ["Engineer", "Accountant", "HR", "Marketing", "Sales", "Operations"]

ROLE_WEIGHTS = {
    "Engineer": 6.0,
    "Accountant": 4.0,
    "HR": 2.0,
    "Marketing": 3.0,
    "Sales": 5.0,
    "Operations": 4.0
}

# Step 4: Default Salary Ranges (No API)
SALARY_RANGES = {
    "Engineer": {"min": 5000, "mid": 8000, "max": 12000},
    "Accountant": {"min": 4000, "mid": 6000, "max": 9000},
    "HR": {"min": 4000, "mid": 5500, "max": 8000},
    "Marketing": {"min": 3500, "mid": 5000, "max": 8000},
    "Sales": {"min": 3000, "mid": 4500, "max": 10000},
    "Operations": {"min": 3000, "mid": 4500, "max": 7000}
}


def calculate_manpower_plan(req: CompanyProfilingRequest, all_employees: List[Dict[str, Any]]) -> Dict[str, Any]:
    selected_positions = [p for p in req.selected_positions if p in DEFAULT_ROLES]
    
    if not selected_positions:
        return {"error": "No valid predefined roles selected. Please select at least one."}

    # Step 1: Ratio Calculation (Selected Positions Only)
    total_weight = sum(ROLE_WEIGHTS.get(r, 1.0) for r in selected_positions)
    ratios = {r: ROLE_WEIGHTS.get(r, 1.0) / total_weight for r in selected_positions}

    # Step 2: Filter Employee Data
    current_employees = [e for e in all_employees if e.get("role") in selected_positions]

    current_headcount = {r: 0 for r in selected_positions}
    for e in current_employees:
        current_headcount[e["role"]] += 1

    # Step 5: Budget Allocation
    current_annual_cost = sum(e["monthly_salary"] * 12 for e in current_employees)
    remaining_budget = req.budget - current_annual_cost

    unallocated_buffer = 0.0
    recommended_hires = {r: 0 for r in selected_positions}
    ideal_headcount = {r: 0 for r in selected_positions}
    department_caps = {r: 0.0 for r in selected_positions}
    gap_status = {r: "Balanced" for r in selected_positions}

    if remaining_budget > 0:
        for role in selected_positions:
            department_caps[role] = remaining_budget * ratios[role]

        for role in selected_positions:
            cost_per_hire = SALARY_RANGES[role]["mid"] * 12
            if cost_per_hire > 0:
                affordable_hires = int(department_caps[role] // cost_per_hire)
                recommended_hires[role] = affordable_hires
                ideal_headcount[role] = current_headcount[role] + affordable_hires
                unallocated_buffer += department_caps[role] - (affordable_hires * cost_per_hire)
            else:
                ideal_headcount[role] = current_headcount[role]
                unallocated_buffer += department_caps[role]

        # Step 6: Surplus Minimization Logic
        while unallocated_buffer > 0:
            affordable_roles = [r for r in selected_positions if (SALARY_RANGES[r]["mid"] * 12) <= unallocated_buffer]
            if not affordable_roles:
                break
            
            # Prioritize the role with the highest weight/ratio
            affordable_roles.sort(key=lambda r: ROLE_WEIGHTS.get(r, 1.0), reverse=True)
            chosen_role = affordable_roles[0]
            
            cost = SALARY_RANGES[chosen_role]["mid"] * 12
            recommended_hires[chosen_role] += 1
            ideal_headcount[chosen_role] += 1
            unallocated_buffer -= cost
    else:
        for role in selected_positions:
            ideal_headcount[role] = current_headcount[role]
        unallocated_buffer = remaining_budget

    # Step 3: Gap Analysis
    for role in selected_positions:
        if recommended_hires[role] >= 2:
            gap_status[role] = "Critical"
        elif recommended_hires[role] == 1:
            gap_status[role] = "Understaffed"
        else:
            gap_status[role] = "Balanced"

    # Step 7: Final Result Compilation
    results = {
        "summary": {
            "current_cost": current_annual_cost,
            "remaining_budget": req.budget - current_annual_cost,
            "unallocated_buffer": max(0, unallocated_buffer) if remaining_budget > 0 else 0
        },
        "role_details": []
    }

    for role in selected_positions:
        results["role_details"].append({
            "role": role,
            "current_headcount": current_headcount[role],
            "ideal_headcount": ideal_headcount[role],
            "recommended_hires": recommended_hires[role],
            "gap_status": gap_status[role],
            "salary_range": SALARY_RANGES[role]
        })

    return results
