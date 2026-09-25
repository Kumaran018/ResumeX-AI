"""
Evidence Analyzer Module for ResumeX-AI.

Compares job skills against candidate resumes to identify:
- mentioned: Whether the skill appears anywhere in the resume
- evidence: Whether practical evidence exists in experience/projects
- strength: "Strong" | "Weak" | "Missing"
- evidence_text: Extracted text snippets supporting the skill
"""

import re
from typing import Any, Dict, List, Optional, Union


def _matches_skill(skill: str, text: str) -> bool:
    """Checks if a skill is mentioned in a given text snippet."""
    if not skill or not text:
        return False

    escaped = re.escape(skill)
    # Handle skills ending or starting with non-word characters (e.g. C++, C#, .NET)
    if re.search(r"\W$", skill) or re.search(r"^\W", skill):
        pattern = rf"(?:^|[\s,;:(/]){escaped}(?:[\s,;:).!?/]|$)"
        return bool(re.search(pattern, text, re.IGNORECASE))
    elif len(skill) <= 2:
        # Case-sensitive for short 1-2 char words like C, R, Go
        return bool(re.search(rf"\b{skill}\b", text))
    else:
        return bool(re.search(rf"\b{escaped}\b", text, re.IGNORECASE))


def _clean_snippet(line: str) -> str:
    """Cleans bullet markers, list numbering, and leading/trailing whitespace."""
    return re.sub(r"^[\s*•\-–—\d\.\)]+\s*", "", line).strip()


def analyze_skill_evidence(skill: str, resume_data: Any) -> Dict[str, Any]:
    """
    Analyzes evidence for a single skill against structured resume data.

    Returns:
    - skill: str
    - mentioned: bool
    - evidence: bool
    - strength: "Strong" | "Weak" | "Missing"
    - evidence_text: str
    """
    if isinstance(resume_data, str):
        try:
            from ai.resume_analyzer import analyze_resume
            resume_data = analyze_resume(resume_data)
        except ImportError:
            resume_data = {"raw_sections": {"text": resume_data}}

    if not isinstance(resume_data, dict):
        return {
            "skill": skill,
            "mentioned": False,
            "evidence": False,
            "strength": "Missing",
            "evidence_text": "",
        }

    skill_clean = skill.strip()
    if not skill_clean:
        return {
            "skill": skill,
            "mentioned": False,
            "evidence": False,
            "strength": "Missing",
            "evidence_text": "",
        }

    # 1. Search for concrete evidence in experience, projects, and certifications
    evidence_snippets: List[str] = []
    seen_snippets = set()

    def add_snippets_from_items(items: Any) -> None:
        if not isinstance(items, list):
            return
        for item in items:
            if not isinstance(item, str):
                continue
            for line in item.splitlines():
                line_clean = line.strip()
                if line_clean and _matches_skill(skill_clean, line_clean):
                    snippet = _clean_snippet(line_clean)
                    if snippet and snippet.lower() not in seen_snippets:
                        seen_snippets.add(snippet.lower())
                        evidence_snippets.append(snippet)

    # Search experience, projects, and certifications
    add_snippets_from_items(resume_data.get("experience", []))
    add_snippets_from_items(resume_data.get("projects", []))
    add_snippets_from_items(resume_data.get("certifications", []))

    # Search other sections in raw_sections (excluding skills and header)
    raw_sections = resume_data.get("raw_sections", {})
    if isinstance(raw_sections, dict):
        for sec_name, sec_text in raw_sections.items():
            if sec_name.lower() in {"skills", "header", "contact"}:
                continue
            if isinstance(sec_text, str) and _matches_skill(skill_clean, sec_text):
                for line in sec_text.splitlines():
                    line_clean = line.strip()
                    if line_clean and _matches_skill(skill_clean, line_clean):
                        snippet = _clean_snippet(line_clean)
                        if snippet and snippet.lower() not in seen_snippets:
                            seen_snippets.add(snippet.lower())
                            evidence_snippets.append(snippet)

    # 2. Check if skill is mentioned anywhere on the resume (including skills section)
    mentioned = False
    claimed_skills = resume_data.get("skills", [])
    if isinstance(claimed_skills, list):
        for cs in claimed_skills:
            if isinstance(cs, str) and (cs.lower() == skill_clean.lower() or _matches_skill(skill_clean, cs)):
                mentioned = True
                break

    if evidence_snippets:
        mentioned = True

    if not mentioned and isinstance(raw_sections, dict):
        for sec_text in raw_sections.values():
            if isinstance(sec_text, str) and _matches_skill(skill_clean, sec_text):
                mentioned = True
                break

    # 3. Determine strength and evidence
    if not mentioned:
        strength = "Missing"
        has_evidence = False
        evidence_text = ""
    elif evidence_snippets:
        strength = "Strong"
        has_evidence = True
        evidence_text = "\n".join(evidence_snippets[:5])
    else:
        # Mentioned in skills list or summary, but without project/work evidence
        strength = "Weak"
        has_evidence = False
        evidence_text = ""

    return {
        "skill": skill_clean,
        "mentioned": mentioned,
        "evidence": has_evidence,
        "strength": strength,
        "evidence_text": evidence_text,
    }


def analyze_evidence(
    job_skills: Union[List[str], Dict[str, Any], str],
    resume_data: Any
) -> Dict[str, Dict[str, Any]]:
    """
    Analyzes evidence for multiple job skills against resume data.

    Accepts job_skills as:
    - List of skill strings: ["Python", "FastAPI", "Docker"]
    - Dict from JobAnalyzer: {"required_skills": [...], "preferred_skills": [...]}
    - Single skill string: "Python"

    Returns:
    Dict mapping skill name to its analysis dict:
    {
        "Python": {
            "skill": "Python",
            "mentioned": True,
            "evidence": True,
            "strength": "Strong",
            "evidence_text": "..."
        },
        ...
    }
    """
    # Extract list of skills from various input formats
    skills_to_check: List[str] = []
    if isinstance(job_skills, dict):
        # Extract required and preferred skills, preserving order and uniqueness
        seen = set()
        candidates = (
            job_skills.get("required_skills", [])
            + job_skills.get("preferred_skills", [])
            + job_skills.get("keywords", [])
        )
        for s in candidates:
            if isinstance(s, str) and s.strip() and s.lower() not in seen:
                seen.add(s.lower())
                skills_to_check.append(s.strip())
    elif isinstance(job_skills, list):
        seen = set()
        for s in job_skills:
            if isinstance(s, str) and s.strip() and s.lower() not in seen:
                seen.add(s.lower())
                skills_to_check.append(s.strip())
    elif isinstance(job_skills, str) and job_skills.strip():
        skills_to_check = [job_skills.strip()]

    results: Dict[str, Dict[str, Any]] = {}
    for skill in skills_to_check:
        results[skill] = analyze_skill_evidence(skill, resume_data)

    return results


class EvidenceAnalyzer:
    """Analyzer class for evaluating resume evidence against job requirements."""

    def analyze(
        self,
        job_skills: Union[List[str], Dict[str, Any], str],
        resume_data: Any
    ) -> Dict[str, Dict[str, Any]]:
        """Analyzes evidence for job skills against a resume."""
        return analyze_evidence(job_skills, resume_data)

    def analyze_skill(self, skill: str, resume_data: Any) -> Dict[str, Any]:
        """Analyzes evidence for a single skill against a resume."""
        return analyze_skill_evidence(skill, resume_data)


__all__ = ["analyze_evidence", "analyze_skill_evidence", "EvidenceAnalyzer"]
