"""
IntelliView — HR Report Generator
===================================
Generates a comprehensive interview report using Gemini
and outputs both structured JSON and Markdown (for PDF conversion).
"""

import os
import json
from datetime import datetime
from typing import Optional

import google.generativeai as genai

gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

REPORT_MODEL = "gemini-2.0-flash"
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


async def generate_report(
    session_data: dict,
    qa_eval: dict,
    coding_eval: dict,
    integrity_eval: dict,
    communication_eval: dict,
    final_score: dict,
) -> dict:
    """
    Generate a comprehensive HR interview report.

    Args:
        session_data: Full session data from InterviewSession.to_dict()
        qa_eval: Q&A evaluation results
        coding_eval: Coding evaluation results
        integrity_eval: Integrity/proctoring evaluation results
        communication_eval: Communication evaluation results
        final_score: Final weighted score and decision

    Returns:
        {
            "report_id": str,
            "markdown": str,
            "json_data": dict,
            "file_path": str
        }
    """
    report_id = f"report_{session_data.get('session_id', 'unknown')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    # Build the report data structure
    report_data = {
        "report_id": report_id,
        "generated_at": datetime.utcnow().isoformat(),
        "candidate": {
            "session_id": session_data.get("session_id", ""),
            "job_title": session_data.get("job_title", ""),
            "interview_date": session_data.get("start_time", ""),
            "interview_duration_minutes": _calc_duration(
                session_data.get("start_time"), session_data.get("end_time")
            ),
        },
        "scores": {
            "final_score": final_score.get("final_score", 0),
            "decision": final_score.get("decision", "UNKNOWN"),
            "recommendation": final_score.get("recommendation", ""),
            "breakdown": final_score.get("breakdown", {}),
        },
        "qa_performance": qa_eval,
        "coding_assessment": coding_eval,
        "integrity_report": integrity_eval,
        "communication_skills": communication_eval,
        "proctoring_events_count": len(session_data.get("proctoring_events", [])),
        "transcript_entries_count": len(session_data.get("transcript", [])),
    }

    # Generate executive summary using Gemini
    executive_summary = await _generate_executive_summary(report_data)
    report_data["executive_summary"] = executive_summary

    # Generate Markdown report
    markdown = _build_markdown_report(report_data, session_data)

    # Save to file
    file_path = os.path.join(REPORTS_DIR, f"{report_id}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(markdown)

    # Also save JSON
    json_path = os.path.join(REPORTS_DIR, f"{report_id}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, default=str)

    return {
        "report_id": report_id,
        "markdown": markdown,
        "json_data": report_data,
        "file_path": file_path,
    }


async def _generate_executive_summary(report_data: dict) -> str:
    """Use Gemini to generate a human-readable executive summary."""
    prompt = f"""Write a concise executive summary (3-4 sentences) for an HR interview report.

Data:
- Position: {report_data['candidate']['job_title']}
- Final Score: {report_data['scores']['final_score']}/100
- Decision: {report_data['scores']['decision']}
- Q&A Score: {report_data['qa_performance'].get('score', 'N/A')}/100
- Coding Score: {report_data['coding_assessment'].get('combined_score', 'N/A')}/100
- Integrity Score: {report_data['integrity_report'].get('score', 'N/A')}/100
- Communication Score: {report_data['communication_skills'].get('score', 'N/A')}/100
- Q&A Strengths: {', '.join(report_data['qa_performance'].get('strengths', []))}
- Q&A Weaknesses: {', '.join(report_data['qa_performance'].get('weaknesses', []))}
- Integrity Flags: {report_data['integrity_report'].get('critical_flags', [])}

Write in a professional, objective tone suitable for an HR manager.
Return ONLY the summary text, no formatting."""

    try:
        model = genai.GenerativeModel(REPORT_MODEL)
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=300,
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Interview completed with a final score of {report_data['scores']['final_score']}/100. Decision: {report_data['scores']['decision']}."


def _build_markdown_report(report_data: dict, session_data: dict) -> str:
    """Build a comprehensive Markdown report."""
    d = report_data
    s = d["scores"]
    qa = d["qa_performance"]
    code = d["coding_assessment"]
    integrity = d["integrity_report"]
    comm = d["communication_skills"]

    # Decision badge
    decision_emoji = {"PASS": "✅", "BORDERLINE": "⚠️", "FAIL": "❌"}.get(s["decision"], "❓")

    # Safely format weighted scores (could be 'N/A' string or numeric)
    def _fmt(val):
        try:
            return f"{float(val):.1f}"
        except (ValueError, TypeError):
            return str(val)

    qa_w = _fmt(s['breakdown'].get('qa', {}).get('weighted', 'N/A'))
    coding_w = _fmt(s['breakdown'].get('coding', {}).get('weighted', 'N/A'))
    integrity_w = _fmt(s['breakdown'].get('integrity', {}).get('weighted', 'N/A'))
    comm_w = _fmt(s['breakdown'].get('communication', {}).get('weighted', 'N/A'))

    md = f"""# IntelliView Interview Report

**Report ID**: {d['report_id']}
**Generated**: {d['generated_at']}

---

## 1. Executive Summary

{d.get('executive_summary', 'No summary available.')}

---

## 2. Candidate Information

| Field | Value |
|---|---|
| **Session ID** | {d['candidate']['session_id']} |
| **Position** | {d['candidate']['job_title']} |
| **Interview Date** | {d['candidate']['interview_date']} |
| **Duration** | {d['candidate']['interview_duration_minutes']} minutes |

---

## 3. Final Score & Decision

| | |
|---|---|
| **Final Score** | **{s['final_score']} / 100** |
| **Decision** | {decision_emoji} **{s['decision']}** |
| **Recommendation** | {s['recommendation']} |

### Score Breakdown

| Dimension | Raw Score | Weight | Weighted Score |
|---|---|---|---|
| Interview Q&A | {s['breakdown'].get('qa', {}).get('raw', 'N/A')} | 40% | {qa_w} |
| Coding Assessment | {s['breakdown'].get('coding', {}).get('raw', 'N/A')} | 30% | {coding_w} |
| Proctoring Integrity | {s['breakdown'].get('integrity', {}).get('raw', 'N/A')} | 20% | {integrity_w} |
| Communication Skills | {s['breakdown'].get('communication', {}).get('raw', 'N/A')} | 10% | {comm_w} |

---

## 4. Interview Q&A Performance

**Score: {qa.get('score', 'N/A')} / 100**

### Strengths
"""

    for s_item in qa.get("strengths", []):
        md += f"- {s_item}\n"

    md += "\n### Areas for Improvement\n"
    for w_item in qa.get("weaknesses", []):
        md += f"- {w_item}\n"

    md += "\n### Per-Question Analysis\n\n"
    for i, q in enumerate(qa.get("per_question", []), 1):
        md += f"""**Q{i}: {q.get('question', 'N/A')}**
- **Answer Summary**: {q.get('answer_summary', 'N/A')}
- **Score**: {q.get('score', 'N/A')}/100
- **Feedback**: {q.get('feedback', 'N/A')}

"""

    md += f"""---

## 5. Coding Assessment

**Combined Score: {code.get('combined_score', 'N/A')} / 100**

| Metric | Value |
|---|---|
| **Correctness** | {code.get('correctness_score', 'N/A')}/100 |
| **Code Quality** | {code.get('quality_score', 'N/A')}/100 |
| **Time Complexity** | {code.get('time_complexity', 'N/A')} |
| **Space Complexity** | {code.get('space_complexity', 'N/A')} |

**Feedback**: {code.get('feedback', 'N/A')}

---

## 6. Proctoring & Integrity Report

**Integrity Score: {integrity.get('score', 'N/A')} / 100**

| Metric | Value |
|---|---|
| **Total Violations** | {integrity.get('violations_count', 0)} |
| **Browser Deductions** | -{integrity.get('breakdown', {}).get('browser_deductions', 0)} |
| **Facial Tracking Deductions** | -{integrity.get('breakdown', {}).get('mediapipe_deductions', 0)} |
| **Vision Analysis Deductions** | -{integrity.get('breakdown', {}).get('vision_deductions', 0)} |

"""

    critical = integrity.get("critical_flags", [])
    if critical:
        md += "### Critical Flags\n"
        for flag in critical:
            md += f"- 🔴 {flag}\n"
        md += "\n"

    md += f"""---

## 7. Communication Skills

**Score: {comm.get('score', 'N/A')} / 100**

| Aspect | Score |
|---|---|
| **Clarity** | {comm.get('clarity', 'N/A')}/100 |
| **Confidence** | {comm.get('confidence', 'N/A')}/100 |
| **Professionalism** | {comm.get('professionalism', 'N/A')}/100 |

**Feedback**: {comm.get('feedback', 'N/A')}

---

*This report was generated automatically by IntelliView AI Interview System.*
*All scores are AI-generated and should be reviewed by a human HR professional.*
"""

    return md


def _calc_duration(start: Optional[str], end: Optional[str]) -> int:
    """Calculate duration in minutes between two ISO timestamps."""
    try:
        if not start or not end:
            return 0
        s = datetime.fromisoformat(start)
        e = datetime.fromisoformat(end)
        return max(0, int((e - s).total_seconds() / 60))
    except Exception:
        return 0
