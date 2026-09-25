"""
Matcher Module for ResumeX-AI.

Compares resume analysis with job analysis and produces:

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

import re

import json
from typing import Any, Dict, List, Union

from ai.evidence_analyzer import analyze_evidence
from ai.job_analyzer import analyze_job
from ai.resume_analyzer import analyze_resume

from ai.resume_improver import (
    generate_resume_improvements,
    ResumeImprover,
)

from ai.hr_reviewer import (
    generate_hr_review,
    HRReviewer,
)

from ai.interview_generator import (
    generate_interview_questions,
    InterviewQuestionGenerator,
)


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
    "llmMetadata",
    "generatedFeatures",
]


def _calculate_score(
    required_skills: List[str],
    preferred_skills: List[str],
    evidence_results: Dict[str, Dict[str, Any]],
) -> float:
    """Calculate weighted resume-job match score from 0 to 100."""

    if not evidence_results:
        return 0.0

    strength_weights = {
        "Strong": 1.0,
        "Weak": 0.5,
        "Missing": 0.0,
    }

    req_set = {
        s.lower()
        for s in required_skills
        if isinstance(s, str)
    }

    pref_set = {
        s.lower()
        for s in preferred_skills
        if isinstance(s, str)
        and s.lower() not in req_set
    }

    req_scores: List[float] = []
    pref_scores: List[float] = []
    other_scores: List[float] = []

    for skill, data in evidence_results.items():
        strength = data.get("strength", "Missing")
        weight = strength_weights.get(strength, 0.0)

        skill_lower = skill.lower()

        if skill_lower in req_set:
            req_scores.append(weight)

        elif skill_lower in pref_set:
            pref_scores.append(weight)

        else:
            other_scores.append(weight)

    if req_scores and pref_scores:
        req_avg = sum(req_scores) / len(req_scores)
        pref_avg = sum(pref_scores) / len(pref_scores)

        final_score = (
            req_avg * 0.8
            + pref_avg * 0.2
        )

    elif req_scores:
        final_score = (
            sum(req_scores) / len(req_scores)
        )

    elif pref_scores:
        final_score = (
            sum(pref_scores) / len(pref_scores)
        )

    elif other_scores:
        final_score = (
            sum(other_scores) / len(other_scores)
        )

    else:
        return 0.0

    return round(
        final_score * 100.0,
        1,
    )


def analyze_keywords(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Analyze job keyword coverage in the resume."""

    job_keywords = list(
        job_data.get("keywords", [])
    )

    if not job_keywords:
        seen = set()

        for skill in (
            job_data.get("required_skills", [])
            + job_data.get("preferred_skills", [])
        ):
            if not isinstance(skill, str):
                continue

            if skill.lower() not in seen:
                seen.add(skill.lower())
                job_keywords.append(skill)

    resume_text_parts: List[str] = []

    raw_sections = resume_data.get(
        "raw_sections",
        {},
    )

    if (
        isinstance(raw_sections, dict)
        and raw_sections
    ):
        for value in raw_sections.values():
            if isinstance(value, str):
                resume_text_parts.append(value)

    else:
        resume_text_parts.extend(
            resume_data.get("skills", [])
        )

        resume_text_parts.extend(
            resume_data.get("experience", [])
        )

        resume_text_parts.extend(
            resume_data.get("projects", [])
        )

        resume_text_parts.extend(
            resume_data.get("education", [])
        )

        resume_text_parts.extend(
            resume_data.get("certifications", [])
        )

        if resume_data.get("summary"):
            resume_text_parts.append(
                resume_data["summary"]
            )

    full_resume_text = " ".join(
        resume_text_parts
    )

    matched: List[str] = []
    missing: List[str] = []

    for keyword in job_keywords:

        if not isinstance(keyword, str):
            continue

        keyword = keyword.strip()

        if not keyword:
            continue

        escaped = re.escape(keyword)

        if (
            re.search(r"\W$", keyword)
            or re.search(r"^\W", keyword)
        ):
            pattern = (
                rf"(?:^|[\s,;:(/])"
                rf"{escaped}"
                rf"(?:[\s,;:).!?/]|$)"
            )

            found = bool(
                re.search(
                    pattern,
                    full_resume_text,
                    re.IGNORECASE,
                )
            )

        elif len(keyword) <= 2:

            found = bool(
                re.search(
                    rf"\b{escaped}\b",
                    full_resume_text,
                )
            )

        else:

            found = bool(
                re.search(
                    rf"\b{escaped}\b",
                    full_resume_text,
                    re.IGNORECASE,
                )
            )

        if found:
            matched.append(keyword)

        else:
            missing.append(keyword)

    total = len(job_keywords)

    percentage = (
        round(
            (len(matched) / total) * 100.0,
            1,
        )
        if total > 0
        else 0.0
    )

    return {
        "totalJobKeywords": total,
        "matchedCount": len(matched),
        "matchedKeywords": matched,
        "missingKeywords": missing,
        "keywordMatchPercentage": percentage,
    }


def analyze_formatting(
    resume_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Evaluate resume structure and section completeness."""

    raw_sections = resume_data.get(
        "raw_sections",
        {},
    )

    has_summary = bool(
        resume_data.get("summary")
        or (
            isinstance(raw_sections, dict)
            and "summary" in raw_sections
        )
    )

    has_experience = bool(
        resume_data.get("experience")
        or (
            isinstance(raw_sections, dict)
            and "experience" in raw_sections
        )
    )

    has_education = bool(
        resume_data.get("education")
        or (
            isinstance(raw_sections, dict)
            and "education" in raw_sections
        )
    )

    has_projects = bool(
        resume_data.get("projects")
        or (
            isinstance(raw_sections, dict)
            and "projects" in raw_sections
        )
    )

    has_skills = bool(
        resume_data.get("skills")
        or (
            isinstance(raw_sections, dict)
            and "skills" in raw_sections
        )
    )

    has_certifications = bool(
        resume_data.get("certifications")
        or (
            isinstance(raw_sections, dict)
            and "certifications" in raw_sections
        )
    )

    score = 100

    issues: List[str] = []

    if not has_experience:
        score -= 30
        issues.append(
            "Missing Work Experience section."
        )

    if not has_education:
        score -= 20
        issues.append(
            "Missing Education section."
        )

    if not has_skills:
        score -= 20
        issues.append(
            "Missing Skills section."
        )

    if not has_projects:
        score -= 15
        issues.append(
            "Missing Projects section."
        )

    if not has_summary:
        score -= 10
        issues.append(
            "Missing Summary / Objective section."
        )

    return {
        "score": max(score, 0),
        "hasSummary": has_summary,
        "hasExperience": has_experience,
        "hasEducation": has_education,
        "hasProjects": has_projects,
        "hasSkills": has_skills,
        "hasCertifications": has_certifications,
        "detectedSections": (
            list(raw_sections.keys())
            if isinstance(raw_sections, dict)
            else []
        ),
        "issues": (
            issues
            if issues
            else [
                "Format and section layout look well-structured."
            ]
        ),
    }


def match_resume_to_job(
    resume: Union[str, Dict[str, Any]],
    job: Union[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """Compare resume data with job data."""
    import time

    t0 = time.time()
    # ANALYZE RESUME

    if isinstance(resume, str):

        if resume.strip().lower().endswith(".pdf"):

            from ai.pdf_extractor import (
                extract_text_from_pdf,
            )

            resume_text = extract_text_from_pdf(
                resume.strip()
            )

            resume_data = analyze_resume(
                resume_text
            )

        else:

            resume_data = analyze_resume(
                resume
            )

    elif isinstance(resume, dict):

        resume_data = resume

    else:

        resume_data = {}

    t1 = time.time()
    print(f"[AI] Resume analysis: {int((t1-t0)*1000)} ms")
    # ANALYZE JOB DESCRIPTION

    if isinstance(job, str):

        job_data = analyze_job(job)

    elif isinstance(job, dict):

        job_data = job

    else:

        job_data = {}

    t2 = time.time()
    print(f"[AI] Job analysis: {int((t2-t1)*1000)} ms")
    # JOB SKILLS

    required_skills = job_data.get(
        "required_skills",
        [],
    )

    preferred_skills = job_data.get(
        "preferred_skills",
        [],
    )

    # EVIDENCE ANALYSIS

    evidence_results = analyze_evidence(
        job_data,
        resume_data,
    )

    strong_skills: List[str] = []
    weak_evidence: List[str] = []
    missing_skills: List[str] = []
    matching_skills: List[str] = []

    for skill, data in evidence_results.items():

        strength = data.get(
            "strength",
            "Missing",
        )

        if strength == "Strong":

            strong_skills.append(skill)
            matching_skills.append(skill)

        elif strength == "Weak":

            weak_evidence.append(skill)
            matching_skills.append(skill)

        else:

            missing_skills.append(skill)

    t3 = time.time()
    print(f"[AI] Evidence analysis: {int((t3-t2)*1000)} ms")
    # MATCH SCORE

    raw_score = _calculate_score(
        required_skills,
        preferred_skills,
        evidence_results,
    )

    match_score = (
        int(raw_score)
        if raw_score.is_integer()
        else raw_score
    )

    # TEMPORARY RESULT

    temp_result = {
        "matchScore": match_score,
        "strongSkills": strong_skills,
        "weakEvidence": weak_evidence,
        "missingSkills": missing_skills,
    }

    # KEYWORD ANALYSIS

    keyword_analysis = analyze_keywords(
        resume_data,
        job_data,
    )

    # FORMATTING ANALYSIS

    formatting = analyze_formatting(
        resume_data,
    )

    t4 = time.time()
    print(f"[AI] Deterministic matching: {int((t4-t3)*1000)} ms")
    # OPENAI GENERATION

    resume_str = resume if isinstance(resume, str) else json.dumps(resume)
    job_str = job if isinstance(job, str) else json.dumps(job)

    from ai.openai_service import get_openai_insights
    openai_result = get_openai_insights(
        resume_str,
        job_str,
        temp_result,
        resume_data,
        job_data,
    )
    
    improvements = openai_result.get("improvements", [])
    hr_review = openai_result.get("hrReview", {})
    interview_questions = openai_result.get("interviewQuestions", [])
    llm_metadata = openai_result.get("llmMetadata", {})
    generated_features = openai_result.get("generatedFeatures", {})

    t5 = time.time()
    print(f"[AI] OpenAI request: {int((t5-t4)*1000)} ms")
    print(f"[AI] Total analysis: {int((t5-t0)*1000)} ms")
    # FINAL RESULT

    return {
        "matchScore": match_score,
        "strongSkills": strong_skills,
        "weakEvidence": weak_evidence,
        "missingSkills": missing_skills,
        "keywordAnalysis": keyword_analysis,
        "formatting": formatting,
        "improvements": improvements,
        "hrReview": hr_review,
        "interviewQuestions": interview_questions,
        "llmMetadata": llm_metadata,
        "generatedFeatures": generated_features,

        # Backward compatibility
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
    """Generate the final 9-field JSON response."""

    full_result = match_resume_to_job(
        resume,
        job,
    )

    return {
        key: full_result[key]
        for key in FINAL_TOP_LEVEL_KEYS
    }


def match(
    resume: Union[str, Dict[str, Any]],
    job: Union[str, Dict[str, Any]],
) -> Dict[str, Any]:
    """Convenient alias for match_resume_to_job."""

    return match_resume_to_job(
        resume,
        job,
    )


class Matcher:
    """Matcher class for comparing resumes against job descriptions."""

    def match(
        self,
        resume: Union[str, Dict[str, Any]],
        job: Union[str, Dict[str, Any]],
    ) -> Dict[str, Any]:

        return match_resume_to_job(
            resume,
            job,
        )

    def match_json(
        self,
        resume: Union[str, Dict[str, Any]],
        job: Union[str, Dict[str, Any]],
    ) -> Dict[str, Any]:

        return generate_final_json(
            resume,
            job,
        )


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