"""
Resume Analyzer Module for ResumeX-AI.

Parses plain-text resumes and extracts structured data:
- Skills
- Education
- Experience
- Projects
- Certifications / Achievements
"""

import re
from typing import Any, Dict, List, Optional, Tuple


# Regex patterns to detect section headers in resumes
SECTION_PATTERNS: Dict[str, List[str]] = {
    "summary": [
        r"summary",
        r"professional\s+summary",
        r"career\s+summary",
        r"about\s+me",
        r"profile",
        r"objective",
        r"career\s+objective",
    ],
    "skills": [
        r"skills?",
        r"technical\s+skills?",
        r"core\s+competencies",
        r"competencies",
        r"technologies",
        r"tools\s*(?:&|and)\s*technologies",
        r"technical\s+proficiencies",
        r"programming\s+languages",
        r"technical\s+expertise",
        r"areas\s+of\s+expertise",
    ],
    "experience": [
        r"experience",
        r"work\s+experience",
        r"professional\s+experience",
        r"employment\s+history",
        r"work\s+history",
        r"job\s+history",
        r"internships?",
        r"career\s+history",
    ],
    "education": [
        r"education",
        r"educational\s+background",
        r"academic\s+background",
        r"academic\s+history",
        r"academic\s+qualifications?",
        r"qualifications?",
        r"academics",
    ],
    "projects": [
        r"projects?",
        r"key\s+projects?",
        r"personal\s+projects?",
        r"academic\s+projects?",
        r"technical\s+projects?",
        r"featured\s+projects?",
        r"projects?\s*(?:&|and)\s*open\s*source",
    ],
    "certifications": [
        r"certifications?",
        r"certificates?",
        r"licenses?(?:\s*(?:&|and)\s*certifications?)?",
        r"certifications?\s*(?:&|and)\s*licenses?",
        r"certifications?\s*(?:&|and)\s*achievements?",
        r"achievements?",
        r"honors?(?:\s*(?:&|and)\s*awards?)?",
        r"awards?(?:\s*(?:&|and)\s*honors?)?",
        r"accomplishments?",
    ],
    "contact": [
        r"contact",
        r"contact\s+info(?:rmation)?",
    ],
}

# Standard common technical skills used for fallback detection
COMMON_SKILLS: List[str] = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Golang",
    "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML", "CSS",
    # Frameworks & Libraries
    "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
    "FastAPI", "Spring Boot", "ASP.NET", ".NET", "Tailwind CSS", "Bootstrap",
    # Data & AI
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "Keras",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    # Cloud, DevOps & Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Linux",
    "Git", "GitHub", "CI/CD", "REST API", "GraphQL", "Microservices"
]


def _is_section_header(line: str) -> Tuple[bool, Optional[str]]:
    """Checks if a line looks like a resume section header."""
    # Clean formatting markers: markdown #, *, _, -, =, :, and whitespace
    cleaned = re.sub(r"^[#*_\-=\s]+", "", line)
    cleaned = re.sub(r"[:#*_\-=\s]+$", "", cleaned).strip()

    # Section headers are usually short (1 to 5 words)
    words = cleaned.split()
    if not (1 <= len(words) <= 5):
        return False, None

    cleaned_lower = cleaned.lower()
    for section_name, patterns in SECTION_PATTERNS.items():
        for pattern in patterns:
            if re.fullmatch(pattern, cleaned_lower):
                return True, section_name

    return False, None


def _parse_sections(text: str) -> Dict[str, str]:
    """Parses resume text into mapped section blocks."""
    sections: Dict[str, List[str]] = {
        "header": [],
        "summary": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
    }

    current_section = "header"
    for line in text.splitlines():
        is_header, section_name = _is_section_header(line)
        if is_header and section_name:
            current_section = section_name
            if current_section not in sections:
                sections[current_section] = []
        else:
            if current_section in sections:
                sections[current_section].append(line)
            else:
                sections[current_section] = [line]

    return {k: "\n".join(v).strip() for k, v in sections.items() if "\n".join(v).strip()}


def _extract_entries(text: str) -> List[str]:
    """Extracts a list of individual entries from section text."""
    if not text.strip():
        return []

    # First check if text is separated into paragraphs by blank lines
    blocks = [b.strip() for b in re.split(r"\n\s*\n+", text.strip()) if b.strip()]
    if len(blocks) > 1:
        return blocks

    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    if not lines:
        return []

    def has_bullet(line_str: str) -> bool:
        return bool(re.match(r"^[*•\-–—]|\d+\.\s+", line_str))

    # If all lines are bullets, each bullet is an entry
    if all(has_bullet(line_str) for line_str in lines):
        return [re.sub(r"^([*•\-–—]|\d+\.\s*)\s*", "", line_str).strip() for line_str in lines]

    # Otherwise, group titles/headers with their subsequent bullet points
    entries: List[str] = []
    current_entry: List[str] = []

    for line_str in lines:
        is_bullet = has_bullet(line_str)
        if not is_bullet and current_entry:
            entries.append("\n".join(current_entry))
            current_entry = [line_str]
        else:
            current_entry.append(line_str)

    if current_entry:
        entries.append("\n".join(current_entry))

    return entries


def _find_common_skills(text: str) -> List[str]:
    """Finds common tech skills in raw text as a fallback."""
    found_skills = []
    for skill in COMMON_SKILLS:
        escaped = re.escape(skill)
        if re.search(r"\W$", skill) or re.search(r"^\W", skill):
            pattern = rf"(?:^|[\s,;:(/]){escaped}(?:[\s,;:).!?/]|$)"
            match = re.search(pattern, text, re.IGNORECASE)
        elif len(skill) <= 2:
            # Case-sensitive for short 1-2 char words like C, R, Go
            match = re.search(rf"\b{skill}\b", text)
        else:
            match = re.search(rf"\b{escaped}\b", text, re.IGNORECASE)

        if match:
            found_skills.append(skill)
    return found_skills


def _extract_skills(skills_text: str, full_resume_text: str = "") -> List[str]:
    """Extracts, cleans, and deduplicates skills from skills section or full text."""
    skills: List[str] = []
    seen = set()

    def add_skill(skill_candidate: str) -> None:
        # Strip proficiency indicators in parentheses (e.g. "(Proficient)", "(3 years)")
        cleaned = re.sub(
            r"\s*\((?:proficient|advanced|intermediate|beginner|expert|\d+\+?\s*years?)\)",
            "",
            skill_candidate,
            flags=re.IGNORECASE,
        ).strip(" \t\r\n•*-,;:")

        if not cleaned or len(cleaned) > 40 or len(cleaned) < 2:
            return

        # Skip generic subheadings
        if cleaned.lower() in {
            "languages", "frameworks", "tools", "databases",
            "libraries", "technologies", "skills", "platforms"
        }:
            return

        if cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            skills.append(cleaned)

    if skills_text.strip():
        for line in skills_text.strip().splitlines():
            line = line.strip()
            if not line:
                continue

            # If line is prefixed by category label (e.g. "Languages: Python, Java")
            if ":" in line:
                prefix, remainder = line.split(":", 1)
                if len(prefix.split()) <= 4:
                    line = remainder.strip()

            # Split line by common delimiters: comma, pipe, semicolon, bullet
            items = re.split(r"[,|;•\t]+", line)
            for item in items:
                # Strip leading bullet/list symbols
                item = re.sub(r"^[\s*•\-–—]+\s*", "", item)
                add_skill(item)

    # Fallback if no skills were found in the section
    if not skills and full_resume_text:
        skills = _find_common_skills(full_resume_text)

    return skills


def analyze_resume(text: str) -> Dict[str, Any]:
    """
    Analyzes a plain-text resume and returns a structured dictionary:
    - skills: List[str]
    - education: List[str]
    - experience: List[str]
    - projects: List[str]
    - certifications: List[str]
    - achievements: List[str] (alias for certifications)
    - summary: str
    - raw_sections: Dict[str, str]
    """
    if not text or not isinstance(text, str):
        return {
            "skills": [],
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            "summary": "",
            "raw_sections": {},
        }

    raw_sections = _parse_sections(text)

    skills = _extract_skills(raw_sections.get("skills", ""), full_resume_text=text)
    education = _extract_entries(raw_sections.get("education", ""))
    experience = _extract_entries(raw_sections.get("experience", ""))
    projects = _extract_entries(raw_sections.get("projects", ""))
    certifications = _extract_entries(raw_sections.get("certifications", ""))
    summary = raw_sections.get("summary", "")

    return {
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "achievements": certifications,
        "summary": summary,
        "raw_sections": raw_sections,
    }


def analyze_resume_pdf(source: Any) -> Dict[str, Any]:
    """Extracts text from a PDF resume and analyzes it."""
    from ai.pdf_extractor import extract_text_from_pdf
    text = extract_text_from_pdf(source)
    return analyze_resume(text)


class ResumeAnalyzer:
    """Analyzer class for extracting structured information from plain-text or PDF resumes."""

    def analyze(self, text: str) -> Dict[str, Any]:
        """Analyzes a plain-text resume and returns structured data."""
        return analyze_resume(text)

    def analyze_pdf(self, source: Any) -> Dict[str, Any]:
        """Analyzes a PDF resume file and returns structured data."""
        return analyze_resume_pdf(source)


__all__ = ["analyze_resume", "analyze_resume_pdf", "ResumeAnalyzer"]
