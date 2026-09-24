"""
Matcher Module for ResumeX-AI.

Compares resume analysis with job analysis to produce:
- matchScore: Overall match percentage (0-100)
- strongSkills: List of skills supported by strong project/work evidence
- weakEvidence: List of skills mentioned without strong evidence
- missingSkills: List of required/preferred job skills missing from resume
- keywordAnalysis: Analysis of keyword coverage between resume and job description
- formatting: Structural and section completeness analysis of the resume
- improvements: Actionable suggestions to improve the resume for the job
- hrReview: Recruiter evaluation, strengths, concerns, and recommendation
- interviewQuestions: Targeted technical and behavioral interview questions
"""

import json
import re
from typing import Any, Dict, List, Optional, Union

from ai.evidence_analyzer import analyze_evidence
from ai.job_analyzer import analyze_job
from ai.resume_analyzer import analyze_resume
from ai.resume_improver import generate_resume_improvements, ResumeImprover
from ai.hr_reviewer import generate_hr_review, HRReviewer
from ai.interview_generator import generate_interview_questions, InterviewQuestionGenerator


FINAL_TOP_LEVEL_KEYS = [
    "matchScore",
    "strongSkills",
    "weakEvidence",
    "missingSkills",
    "keywordAnalysis",
    "formatting",
    "improvements",
    "hrReview",
    "interviewQuestions",
]


def _calculate_score(
    required_skills: List[str],
    preferred_skills: List[str],
    evidence_results: Dict[str, Dict[str, Any]],
) -> float:
    """Calculates weighted match score (0-100) based on skill priorities and evidence strength."""
    if not evidence_results:
        return 0.0

    strength_weights = {
        "Strong": 1.0,
        "Weak": 0.5,
        "Missing": 0.0,
    }

    req_set = {s.lower() for s in required_skills}
    pref_set = {s.lower() for s in preferred_skills if s.lower() not in req_set}

    req_scores: List[float] = []
    pref_scores: List[float] = []
    other_scores: List[float] = []

    for skill, data in evidence_results.items():
        strength = data.get("strength", "Missing")
        weight = strength_weights.get(strength, 0.0)
        s_lower = skill.lower()

        if s_lower in req_set:
            req_scores.append(weight)
        elif s_lower in pref_set:
            pref_scores.append(weight)
        else:
            other_scores.append(weight)

    if req_scores and pref_scores:
        req_avg = sum(req_scores) / len(req_scores)
        pref_avg = sum(pref_scores) / len(pref_scores)
        # 80% weight to required skills, 20% to preferred skills
        final_score = (req_avg * 0.8) + (pref_avg * 0.2)
    elif req_scores:
        final_score = sum(req_scores) / len(req_scores)
    elif pref_scores:
        final_score = sum(pref_scores) / len(pref_scores)
    elif other_scores:
        final_score = sum(other_scores) / len(other_scores)
    else:
        return 0.0

    return round(final_score * 100.0, 1)


def analyze_keywords(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Analyzes presence of job keywords across the candidate resume."""
    job_keywords = job_data.get("keywords", [])
    if not job_keywords:
        seen = set()
        for s in job_data.get("required_skills", []) + job_data.get("preferred_skills", []):
            if s.lower() not in seen:
                seen.add(s.lower())
                job_keywords.append(s)

    resume_text_parts: List[str] = []
    raw_sections = resume_data.get("raw_sections", {})
    if isinstance(raw_sections, dict) and raw_sections:
        resume_text_parts.extend(raw_sections.values())
    else:
        resume_text_parts.extend(resume_data.get("skills", []))
        resume_text_parts.extend(resume_data.get("experience", []))
        resume_text_parts.extend(resume_data.get("projects", []))
        resume_text_parts.extend(resume_data.get("education", []))
        resume_text_parts.extend(resume_data.get("certifications", []))
        if resume_data.get("summary"):
            resume_text_parts.append(resume_data["summary"])

    full_resume_text = " ".join(resume_text_parts)

    matched: List[str] = []
    missing: List[str] = []

    for kw in job_keywords:
        escaped = re.escape(kw)
        if re.search(r"\W$", kw) or re.search(r"^\W", kw):
            pattern = rf"(?:^|[\s,;:(/]){escaped}(?:[\s,;:).!?/]|$)"
            found = bool(re.search(pattern, full_resume_text, re.IGNORECASE))
        elif len(kw) <= 2:
            found = bool(re.search(rf"\b{kw}\b", full_resume_text))
        else:
            found = bool(re.search(rf"\b{escaped}\b", full_resume_text, re.IGNORECASE))

        if found:
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(job_keywords)
    percentage = round((len(matched) / total * 100.0), 1) if total > 0 else 0.0

    return {
        "totalJobKeywords": total,
        "matchedCount": len(matched),
        "matchedKeywords": matched,
        "missingKeywords": missing,
        "keywordMatchPercentage": percentage,
    }


def analyze_formatting(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluates resume structure, sections, and formatting completeness."""
    raw_sections = resume_data.get("raw_sections", {})
    has_summary = bool(resume_data.get("summary") or (isinstance(raw_sections, dict) and "summary" in raw_sections))
    has_experience = bool(resume_data.get("experience") or (isinstance(raw_sections, dict) and "experience" in raw_sections))
    has_education = bool(resume_data.get("education") or (isinstance(raw_sections, dict) and "education" in raw_sections))
    has_projects = bool(resume_data.get("projects") or (isinstance(raw_sections, dict) and "projects" in raw_sections))
    has_skills = bool(resume_data.get("skills") or (isinstance(raw_sections, dict) and "skills" in raw_sections))
    has_certifications = bool(resume_data.get("certifications") or (isinstance(raw_sections, dict) and "certifications" in raw_sections))

    score = 100
    issues: List[str] = []

    if not has_experience:
        score -= 30
        issues.append("Missing Work Experience section.")
    if not has_education:
        score -= 20
        issues.append("Missing Education section.")
    if not has_skills:
        score -= 20
        issues.append("Missing Skills section.")
    if not has_projects:
        score -= 15
        issues.append("Missing Projects section.")
    if not has_summary:
        score -= 10
        issues.append("Missing Summary / Objective section.")

    return {
        "score": max(score, 0),
        "hasSummary": has_summary,
        "hasExperience": has_experience,
        "hasEducation": has_education,
        "hasProjects": has_projects,
        "hasSkills": has_skills,
        "hasCertifications": has_certifications,
        "detectedSections": list(raw_sections.keys()) if isinstance(raw_sections, dict) else [],
        "issues": issues if issues else ["Format and section layout look well-structured."],
    }





def match_resume_to_job(
    resume: Union[str, Dict[str, Any]],
    job: Union[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Compares resume data with job data and produces complete matching metrics and analysis:
    - matchScore: float/int (0 to 100)
    - strongSkills: List[str]
    - weakEvidence: List[str]
    - missingSkills: List[str]
    - keywordAnalysis: Dict[str, Any]
    - formatting: Dict[str, Any]
    - improvements: List[str]
    - hrReview: Dict[str, Any]
    - interviewQuestions: List[Dict[str, str]]
    """
    if isinstance(resume, str):
        if resume.strip().lower().endswith(".pdf"):
            from ai.pdf_extractor import extract_text_from_pdf
            resume_data = analyze_resume(extract_text_from_pdf(resume.strip()))
        else:
            resume_data = analyze_resume(resume)
    elif isinstance(resume, dict):
        resume_data = resume
    else:
        resume_data = {}

    if isinstance(job, str):
        job_data = analyze_job(job)
    elif isinstance(job, dict):
        job_data = job
    else:
        job_data = {}

    required_skills = job_data.get("required_skills", [])
    preferred_skills = job_data.get("preferred_skills", [])

    # Run evidence analysis across all job skills
    evidence_results = analyze_evidence(job_data, resume_data)

    strong_skills: List[str] = []
    weak_evidence: List[str] = []
    missing_skills: List[str] = []
    matching_skills: List[str] = []

    for skill, data in evidence_results.items():
        strength = data.get("strength", "Missing")
        if strength == "Strong":
            strong_skills.append(skill)
            matching_skills.append(skill)
        elif strength == "Weak":
            weak_evidence.append(skill)
            matching_skills.append(skill)
        else:
            missing_skills.append(skill)

    raw_score = _calculate_score(required_skills, preferred_skills, evidence_results)
    match_score = int(raw_score) if raw_score.is_integer() else raw_score

    temp_result = {
        "matchScore": match_score,
        "strongSkills": strong_skills,
        "weakEvidence": weak_evidence,
        "missingSkills": missing_skills,
    }

    # Generate extended analysis components
    keyword_analysis = analyze_keywords(resume_data, job_data)
    formatting = analyze_formatting(resume_data)
    improvements = generate_resume_improvements(resume_data, job_data, temp_result)
    hr_review = generate_hr_review(resume_data, job_data, temp_result)
    interview_questions = generate_interview_questions(resume_data, job_data, temp_result)

    return {
        # 9 Top-Level Fields (STEP 11 JSON Structure)
        "matchScore": match_score,
        "strongSkills": strong_skills,
        "weakEvidence": weak_evidence,
        "missingSkills": missing_skills,
        "keywordAnalysis": keyword_analysis,
        "formatting": formatting,
        "improvements": improvements,
        "hrReview": hr_review,
        "interviewQuestions": interview_questions,
        # Backward-compatibility aliases
        "matching_skills": matching_skills,
        "matchingSkills": matching_skills,
        "match_score": match_score,
        "strong_skills": strong_skills,
        "weak_evidence": weak_evidence,
        "missing_skills": missing_skills,
        "evidence_details": evidence_results,
    }


def generate_final_json(
    resume: Union[str, Dict[str, Any]],
    job: Union[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Produces the consistent final JSON output containing strictly the 9 required top-level fields:
    - matchScore
    - strongSkills
    - weakEvidence
    - missingSkills
    - keywordAnalysis
    - formatting
    - improvements
    - hrReview
    - interviewQuestions
    """
    full_result = match_resume_to_job(resume, job)
    return {k: full_result[k] for k in FINAL_TOP_LEVEL_KEYS}


# Convenient alias function
def match(
    resume: Union[str, Dict[str, Any]],
    job: Union[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """Alias for match_resume_to_job."""
    return match_resume_to_job(resume, job)


class Matcher:
    """Matcher class for comparing resumes against job descriptions."""

    def match(
        self,
        resume: Union[str, Dict[str, Any]],
        job: Union[str, Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Matches a resume against a job description."""
        return match_resume_to_job(resume, job)

    def match_json(
        self,
        resume: Union[str, Dict[str, Any]],
        job: Union[str, Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Returns the consistent final JSON structure with the 9 top-level fields."""
        return generate_final_json(resume, job)


__all__ = [
    "match_resume_to_job",
    "generate_final_json",
    "match",
    "Matcher",
    "analyze_keywords",
    "analyze_formatting",
    "generate_resume_improvements",
    "ResumeImprover",
    "generate_hr_review",
    "HRReviewer",
    "generate_interview_questions",
    "InterviewQuestionGenerator",
    "FINAL_TOP_LEVEL_KEYS",
]
