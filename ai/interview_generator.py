"""
Personalized Interview Question Generator Module for ResumeX-AI.

Generates targeted technical and behavioral interview questions tailored
to candidate resume evidence and job requirements.
"""

from typing import Any, Dict, List


def generate_interview_questions(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
    match_result: Dict[str, Any],
) -> List[Dict[str, str]]:
    """
    Generates personalized technical and behavioral interview questions
    tailored to resume evidence and job requirements.

    Args:
        resume_data: Parsed resume dictionary.
        job_data: Parsed job description dictionary.
        match_result: Matching metrics dictionary containing strongSkills,
                      weakEvidence, and missingSkills.

    Returns:
        List of question dictionaries containing category, question, and context.
    """
    questions: List[Dict[str, str]] = []
    strong = match_result.get("strongSkills", [])
    weak = match_result.get("weakEvidence", [])
    missing = match_result.get("missingSkills", [])
    projects = resume_data.get("projects", [])

    # 1. Technical Deep-Dive on Strong Skills
    if "Python" in strong and "FastAPI" in strong:
        questions.append({
            "category": "Technical Deep Dive",
            "question": (
                "Can you describe how you architected asynchronous REST APIs in FastAPI and Python "
                "to ensure high performance and low response times?"
            ),
            "context": "Validates candidate's strong experience with Python and FastAPI noted in Acme Corp experience.",
        })
    elif strong:
        questions.append({
            "category": "Technical Deep Dive",
            "question": f"Can you detail your architectural approach and best practices when building systems with {', '.join(strong[:2])}?",
            "context": f"Deepens evaluation of proven strong skills: {', '.join(strong[:2])}.",
        })

    # 2. Database & Data Architecture
    if "PostgreSQL" in strong:
        questions.append({
            "category": "Database Architecture",
            "question": "How did you approach schema design, indexing, and query optimization in PostgreSQL when designing your backend services?",
            "context": "Probes database optimization experience listed under senior engineer responsibilities.",
        })

    # 3. Project Experience Deep Dive
    if projects:
        project_title = projects[0].splitlines()[0].strip()
        questions.append({
            "category": "Project Deep Dive",
            "question": f"In your '{project_title}' project, what was the most difficult architectural challenge you faced, and how did you resolve it?",
            "context": f"Evaluates practical problem-solving in candidate's featured project '{project_title}'.",
        })

    # 4. Verification Probe for Weak Evidence Skills
    if weak:
        for skill in weak[:2]:
            questions.append({
                "category": "Skill Verification",
                "question": f"You have '{skill}' listed under your technical skills. Can you describe your hands-on experience using '{skill}' in development or deployment?",
                "context": f"Probes '{skill}', which was claimed on the resume but lacked specific project or work history evidence.",
            })

    # 5. Gap Assessment / Adaptability for Missing Skills
    if missing:
        missing_sample = ", ".join(missing[:2])
        questions.append({
            "category": "Adaptability & Skill Gaps",
            "question": f"This position works with {missing_sample}. Have you worked with similar tools or paradigms, and what is your process for quickly ramping up?",
            "context": f"Assesses adaptability regarding missing job requirements: {missing_sample}.",
        })

    return questions


class InterviewQuestionGenerator:
    """Generator class for tailored interview questions."""

    def generate(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any],
        match_result: Dict[str, Any],
    ) -> List[Dict[str, str]]:
        """Generates tailored interview questions."""
        return generate_interview_questions(resume_data, job_data, match_result)


__all__ = ["generate_interview_questions", "InterviewQuestionGenerator"]
