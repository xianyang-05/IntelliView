"""
Performance review pipeline.
Orchestrates: mock data → scoring → edge detection → LLM review → merged results.
"""

from .mock_data import EMPLOYEES
from .scorer import calculate_scores
from .edge_detector import detect_edge_cases
from .llm_reviewer import review_employee


def run_pipeline() -> list[dict]:
    """
    Run the full performance review pipeline.
    Returns a list of employee results with scores, categories, and optional LLM reviews.
    """
    print("Performance pipeline: Step 1 — Scoring all employees...")
    scored = calculate_scores(EMPLOYEES)

    print("Performance pipeline: Step 2 — Detecting edge cases...")
    edge_flags = detect_edge_cases(scored)
    print(f"   → {len(edge_flags)} employees flagged for LLM review")

    print("Performance pipeline: Step 3 — LLM reviewing flagged employees...")

    results = []
    for row in scored:
        emp_id = row["employee_id"]
        is_edge = emp_id in edge_flags

        result = {
            "employee_id": emp_id,
            "name": row["name"],
            "role": row["role"],
            "score": row["final_score"],
            "rule_category": row["category"],
            "is_edge_case": is_edge,
            "quality_trend": row["quality_trend"],
            "timeliness_trend": row["timeliness_trend"],
            "tasks_completed": row["tasks_completed"],
            "on_time_rate": row["on_time_rate"],
            "quality_score": row["quality_score"],
            "kpi_score": row["kpi_score"],
            "collaboration": row["collaboration"],
            "attendance": row["attendance"],
            "edge_reasons": edge_flags.get(emp_id, []),
            "llm_review": None,
            "final_category": row["category"],
        }

        if is_edge:
            print(f"   → LLM reviewing: {row['name']}...")
            review = review_employee(row, edge_flags[emp_id])
            result["llm_review"] = review
            result["final_category"] = review.get("final_category", row["category"])

        results.append(result)

    # Sort by score descending
    results.sort(key=lambda r: r["score"], reverse=True)

    print(f"Performance pipeline: Done. {len(results)} employees processed.")
    return results
