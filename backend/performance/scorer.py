"""
Weighted performance scorer with trend detection.
"""

WEIGHTS = {
    "productivity": 0.30,
    "quality": 0.25,
    "reliability": 0.15,
    "collaboration": 0.15,
    "kpi": 0.15,
}

TASKS_MIN = 40
TASKS_MAX = 140


def _normalize(value: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.0
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def calculate_scores(employees: list[dict]) -> list[dict]:
    """Score each employee and attach computed fields."""
    results = []

    for emp in employees:
        row = dict(emp)  # copy

        # Normalized component scores (0–1)
        prod_score = (
            _normalize(row["tasks_completed"], TASKS_MIN, TASKS_MAX) * 0.6
            + row["on_time_rate"] * 0.4
        )
        qual_score = _normalize(row["quality_score"], 1, 5)
        rel_score = row["attendance"]
        collab_score = _normalize(row["collaboration"], 1, 5)
        kpi_norm = row["kpi_score"]

        # Weighted composite → scale 0-100
        final_score = (
            prod_score * WEIGHTS["productivity"]
            + qual_score * WEIGHTS["quality"]
            + rel_score * WEIGHTS["reliability"]
            + collab_score * WEIGHTS["collaboration"]
            + kpi_norm * WEIGHTS["kpi"]
        ) * 100

        # Trends
        quality_trend = row["quality_score"] - row["prev_quality_score"]
        timeliness_trend = row["on_time_rate"] - row["prev_on_time_rate"]

        row.update(
            {
                "prod_score": round(prod_score, 3),
                "qual_score": round(qual_score, 3),
                "rel_score": round(rel_score, 3),
                "collab_score": round(collab_score, 3),
                "kpi_norm": round(kpi_norm, 3),
                "final_score": round(final_score, 1),
                "quality_trend": round(quality_trend, 2),
                "timeliness_trend": round(timeliness_trend, 2),
                "category": assign_category(final_score),
            }
        )
        results.append(row)

    return results


def assign_category(score: float) -> str:
    if score >= 75:
        return "Raise / Promote"
    elif score >= 55:
        return "Neutral"
    else:
        return "At Risk / PIP"
