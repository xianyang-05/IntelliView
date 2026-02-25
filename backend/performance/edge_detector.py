"""
Detects edge cases that need LLM review.
Only ambiguous or conflicting profiles are flagged.
"""


def detect_edge_cases(scored_employees: list[dict]) -> dict[str, list[str]]:
    """
    Returns a dict of employee_id → list of flag reasons.
    Only employees with at least one flag are included.
    """
    flags: dict[str, list[str]] = {}

    for row in scored_employees:
        reasons: list[str] = []

        # High output but terrible quality
        if row["tasks_completed"] > 100 and row["quality_score"] < 3.5:
            reasons.append(
                "High volume but low quality — quantity over quality risk"
            )

        # Low on-time but high quality
        if row["on_time_rate"] < 0.65 and row["quality_score"] > 4.2:
            reasons.append(
                "Slow but high quality — possible workload or scoping issue"
            )

        # Strong improving trend from low baseline
        if row["quality_trend"] > 0.3 and row["final_score"] < 70:
            reasons.append(
                "Significant improvement trend despite lower score"
            )

        # High soft skills but low output
        if row["collaboration"] > 4.3 and row["tasks_completed"] < 60:
            reasons.append(
                "Strong team player but low individual output"
            )

        # Score near decision boundary (50-65 range)
        if 50 <= row["final_score"] <= 65:
            reasons.append(
                "Score on the borderline — needs nuanced review"
            )

        # Declining quality trend
        if row["quality_trend"] < -0.2 and row["final_score"] > 55:
            reasons.append(
                "Quality declining — may need early intervention"
            )

        if reasons:
            flags[row["employee_id"]] = reasons

    return flags
