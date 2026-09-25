"""
Resume Improver Module for ResumeX-AI.

Generates targeted, actionable resume improvement suggestions based on
job requirements, evidence analysis, and skill gaps.
"""

import re
from typing import Any, Dict, List


def generate_resume_improvements(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
    match_result: Dict[str, Any],
) -> List[str]:
    """
    Generates targeted, actionable resume improvement suggestions based on
    job requirements and evidence analysis.

    Args:
        resume_data: Parsed resume dictionary.
        job_data: Parsed job description dictionary.
        match_result: Matching metrics dictionary containing strongSkills,
                      weakEvidence, and missingSkills.

    Returns:
        List of actionable improvement recommendations.
    """
    suggestions: List[str] = []

    # 1. Address weak evidence skills
    weak_skills = match_result.get("weakEvidence", [])
    if weak_skills:
        for skill in weak_skills[:3]:
            suggestions.append(
                f"Add concrete project or work experience demonstrating your use of '{skill}'. "
                f"Currently it is listed only under skills without supporting achievements or context."
            )

    # 2. Address missing required/preferred skills
    missing_skills = match_result.get("missingSkills", [])
    req_missing = [s for s in missing_skills if s in job_data.get("required_skills", [])]
    pref_missing = [s for s in missing_skills if s in job_data.get("preferred_skills", [])]

    if req_missing:
        suggestions.append(
            f"Highlight or acquire missing required skills: {', '.join(req_missing)}. "
            f"Include relevant projects or coursework if you have foundational knowledge."
        )
    elif pref_missing:
        suggestions.append(
            f"Strengthen your candidacy by highlighting bonus/preferred competencies: {', '.join(pref_missing[:3])}."
        )

    # 3. Check for quantified metrics in experience
    has_metrics = False
    for exp in resume_data.get("experience", []):
        if re.search(r"\b\d+[%+kKmM]?\b", exp):
            has_metrics = True
            break
    if not has_metrics:
        suggestions.append(
            "Quantify your achievements in the Experience section using measurable metrics "
            "(e.g., latency reduction, throughput, percentages, or team scale)."
        )
    else:
        suggestions.append(
            "Continue quantifying impact across all bullet points with clear business outcomes and performance metrics."
        )

    # 4. Tailor summary & headline
    role = (
        job_data.get("raw_sections", {}).get("about", "").splitlines()[0]
        if job_data.get("raw_sections", {}).get("about")
        else "the target role"
    )
    req_preview = job_data.get("required_skills", [])[:3]
    suggestions.append(
        f"Tailor your professional summary and headline specifically for '{role}' by incorporating key terms like "
        f"{', '.join(req_preview) if req_preview else 'core technologies'}."
    )

    return suggestions


class ResumeImprover:
    """Analyzer class for generating resume improvement recommendations."""

    def generate(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        match_result: Dict[str, Any],
    ) -> List[str]:
        """Generates resume improvement suggestions."""
        return generate_resume_improvements(resume_data, job_data, match_result)


__all__ = ["generate_resume_improvements", "ResumeImprover"]
