"""
HR Recruiter Review Module for ResumeX-AI.

Generates executive candidate assessments, hiring recommendations,
key strengths, and areas of concern for recruiter review.
"""

from typing import Any, Dict, List


def generate_hr_review(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
    match_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generates an HR recruiter review and candidate assessment.

    Args:
        resume_data: Parsed resume dictionary.
        job_data: Parsed job description dictionary.
        match_result: Matching metrics dictionary containing matchScore,
                      strongSkills, weakEvidence, and missingSkills.

    Returns:
        Dictionary containing candidateName, targetRole, matchScore,
        recommendation, summary, strengths, and concerns.
    """
    header = resume_data.get("raw_sections", {}).get("header", "")
    candidate_name = header.splitlines()[0].strip() if header else "Candidate"

    about = job_data.get("raw_sections", {}).get("about", "")
    target_role = about.splitlines()[0].strip() if about else "Target Role"

    score = match_result.get("matchScore", 0.0)
    strong = match_result.get("strongSkills", [])
    weak = match_result.get("weakEvidence", [])
    missing = match_result.get("missingSkills", [])

    if score >= 75.0:
        recommendation = "Strong Candidate - Highly Recommended for Technical Screening"
    elif score >= 50.0:
        recommendation = "Moderate Match - Recommended with Targeted Technical Verification"
    else:
        recommendation = "Low Match - Consider for Alternative Openings or Junior Positions"

    strengths: List[str] = []
    if strong:
        strengths.append(
            f"Demonstrated strong, verified experience in core technologies: {', '.join(strong)}."
        )
    if resume_data.get("certifications"):
        strengths.append(
            f"Holds relevant industry credential(s): {', '.join(resume_data['certifications'])}."
        )
    if resume_data.get("projects"):
        strengths.append(
            f"Demonstrated hands-on initiative with relevant projects: "
            f"{', '.join([p.splitlines()[0] for p in resume_data['projects']])}."
        )

    concerns: List[str] = []
    if missing:
        concerns.append(f"Lacks evidence for job requirements: {', '.join(missing)}.")
    if weak:
        concerns.append(
            f"Unverified skill claims needing screening: {', '.join(weak)} "
            f"(listed in skills but lacks project/work evidence)."
        )
    if not concerns:
        concerns.append("No critical skill gaps identified for this role.")

    summary = (
        f"{candidate_name} achieves an overall match score of {score}% for the {target_role} position. "
        f"The candidate exhibits strong alignment with core requirements ({', '.join(strong[:3])}), "
        f"though screening should confirm practical familiarity with {', '.join(weak + missing[:2])}."
    )

    return {
        "candidateName": candidate_name,
        "targetRole": target_role,
        "matchScore": score,
        "recommendation": recommendation,
        "summary": summary,
        "strengths": strengths,
        "concerns": concerns,
    }


class HRReviewer:
    """Analyzer class for evaluating candidates from a recruiter perspective."""

    def review(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        match_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generates an HR recruiter assessment."""
        return generate_hr_review(resume_data, job_data, match_result)

    def generate(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        match_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Alias for review."""
        return generate_hr_review(resume_data, job_data, match_result)


__all__ = ["generate_hr_review", "HRReviewer"]
