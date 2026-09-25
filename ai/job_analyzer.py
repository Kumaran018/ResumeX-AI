"""
Job Analyzer Module for ResumeX-AI.

Parses plain-text job descriptions and extracts structured data:
- required_skills
- preferred_skills
- responsibilities
- qualifications
- keywords
- raw_sections
"""

import re
from typing import Any, Dict, List, Optional, Tuple


# Regex patterns to detect section headers in job descriptions
SECTION_PATTERNS: Dict[str, List[str]] = {
    "responsibilities": [
        r"responsibilities",
        r"key\s+responsibilities",
        r"what\s+you(?:'ll|\s+will)\s+do",
        r"what\s+you\s+will\s+be\s+doing",
        r"the\s+role",
        r"role\s+overview",
        r"duties(?:\s*(?:&|and)\s*responsibilities)?",
        r"your\s+impact",
        r"job\s+responsibilities",
    ],
    "required_qualifications": [
        r"requirements?",
        r"required(?:\s+qualifications?)?",
        r"minimum\s+qualifications?",
        r"basic\s+qualifications?",
        r"what\s+we(?:'re|\s+are)\s+looking\s+for",
        r"what\s+you(?:'ll|\s+need|\s+bring)",
        r"what\s+you\s+need",
        r"must\s+haves?",
        r"eligibility(?:\s+criteria)?",
        r"who\s+you\s+are",
    ],
    "preferred_qualifications": [
        r"preferred(?:\s+qualifications?)?",
        r"preferred\s+skills?",
        r"desired\s+qualifications?",
        r"desired\s+skills?",
        r"nice\s+to\s+haves?",
        r"bonus(?:\s+points)?",
        r"bonus\s+qualifications?",
        r"good\s+to\s+have",
        r"pluses?",
        r"additional\s+qualifications?",
    ],
    "skills": [
        r"skills?",
        r"technical\s+skills?",
        r"tech\s+stack",
        r"technologies",
        r"tools(?:\s*(?:&|and)\s*technologies)?",
        r"core\s+competencies",
    ],
    "about": [
        r"about\s+the\s+role",
        r"about\s+us",
        r"about\s+the\s+company",
        r"job\s+summary",
        r"overview",
        r"company\s+overview",
    ],
}

# Standard technical skills and tools commonly referenced in job descriptions
COMMON_SKILLS: List[str] = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Golang",
    "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML", "CSS",
    # Frameworks & Web
    "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
    "FastAPI", "Spring Boot", "ASP.NET", ".NET", "Tailwind CSS", "Bootstrap",
    # Data & AI
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "Keras",
    "Machine Learning", "Deep Learning", "NLP", "LLMs", "Computer Vision",
    # Cloud, DevOps & Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Elasticsearch",
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Linux",
    "Git", "GitHub", "GitLab", "CI/CD", "Jenkins", "REST API", "GraphQL", "Microservices",
    "Agile", "Scrum", "TDD", "Unit Testing", "System Design"
]


def _is_section_header(line: str) -> Tuple[bool, Optional[str]]:
    """Checks if a line looks like a job description section header."""
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
    """Parses job description text into mapped section blocks."""
    sections: Dict[str, List[str]] = {
        "about": [],
        "responsibilities": [],
        "required_qualifications": [],
        "preferred_qualifications": [],
        "skills": [],
    }

    current_section = "about"
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
    """Extracts a list of individual entries or bullet points from section text."""
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


def _extract_skills_from_text(text: str) -> List[str]:
    """Finds and extracts known skills and technologies from text."""
    if not text:
        return []

    found: List[str] = []
    seen = set()

    # 1. Check for explicit delimited list lines (e.g. "Tech Stack: Python, Go, C++")
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if re.match(r"^(?:tech\s+stack|technologies|skills?|languages?|frameworks?|tools?)\s*[:\-]", line, re.IGNORECASE):
            parts = line.split(":", 1) if ":" in line else line.split("-", 1)
            if len(parts) > 1:
                tokens = re.split(r"[,|;•\t]+", parts[1])
                for token in tokens:
                    token = token.strip(" \t\r\n•*-,;:")
                    if token and len(token) < 35 and token.lower() not in seen:
                        seen.add(token.lower())
                        found.append(token)

    # 2. Match known common skills via word boundary / regex
    for skill in COMMON_SKILLS:
        if skill.lower() in seen:
            continue
        escaped = re.escape(skill)
        if re.search(r"\W$", skill) or re.search(r"^\W", skill):
            pattern = rf"(?:^|[\s,;:(/]){escaped}(?:[\s,;:).!?/]|$)"
            match = re.search(pattern, text, re.IGNORECASE)
        elif len(skill) <= 2:
            match = re.search(rf"\b{skill}\b", text)
        else:
            match = re.search(rf"\b{escaped}\b", text, re.IGNORECASE)

        if match:
            seen.add(skill.lower())
            found.append(skill)

    return found


def _extract_skills_by_priority(raw_sections: Dict[str, str], full_text: str) -> Tuple[List[str], List[str]]:
    """Extracts required and preferred skills based on section mapping or keyword context."""
    req_text = raw_sections.get("required_qualifications", "")
    pref_text = raw_sections.get("preferred_qualifications", "")
    skills_text = raw_sections.get("skills", "")

    preferred_skills: List[str] = []
    required_skills: List[str] = []

    # If preferred section exists, extract from it directly
    if pref_text:
        preferred_skills = _extract_skills_from_text(pref_text)

    # If required section exists, extract from it and general skills
    if req_text:
        required_skills = _extract_skills_from_text(req_text + "\n" + skills_text)
    elif skills_text:
        required_skills = _extract_skills_from_text(skills_text)

    # If no explicit preferred section, check for inline bonus / nice-to-have patterns
    if not preferred_skills:
        bonus_lines = []
        regular_lines = []
        for line in full_text.splitlines():
            if re.search(r"\b(bonus|nice\s+to\s+have|preferred|plus|optional)\b", line, re.IGNORECASE):
                bonus_lines.append(line)
            else:
                regular_lines.append(line)
        if bonus_lines:
            preferred_skills = _extract_skills_from_text("\n".join(bonus_lines))
            if not required_skills:
                required_skills = _extract_skills_from_text("\n".join(regular_lines))

    # Fallback: If required_skills is still empty, scan full text
    if not required_skills:
        all_skills = _extract_skills_from_text(full_text)
        required_skills = [s for s in all_skills if s not in set(preferred_skills)]

    # Ensure no overlap: if a skill is in required, remove from preferred
    req_set = {s.lower() for s in required_skills}
    preferred_skills = [s for s in preferred_skills if s.lower() not in req_set]

    return required_skills, preferred_skills


def analyze_job(text: str) -> Dict[str, Any]:
    """
    Analyzes a plain-text job description and returns a structured dictionary:
    - required_skills: List[str]
    - preferred_skills: List[str]
    - responsibilities: List[str]
    - qualifications: List[str]
    - keywords: List[str]
    - raw_sections: Dict[str, str]
    """
    if not text or not isinstance(text, str):
        return {
            "required_skills": [],
            "preferred_skills": [],
            "responsibilities": [],
            "qualifications": [],
            "keywords": [],
            "raw_sections": {},
        }

    raw_sections = _parse_sections(text)

    responsibilities = _extract_entries(raw_sections.get("responsibilities", ""))

    # Qualifications combine required and preferred qualifications
    qualifications: List[str] = []
    if "required_qualifications" in raw_sections:
        qualifications.extend(_extract_entries(raw_sections["required_qualifications"]))
    if "preferred_qualifications" in raw_sections:
        qualifications.extend(_extract_entries(raw_sections["preferred_qualifications"]))

    # Extract required vs preferred skills
    required_skills, preferred_skills = _extract_skills_by_priority(raw_sections, text)

    # Keywords include all required, preferred, and general skills/concepts across the job posting
    all_skills = _extract_skills_from_text(text)
    keywords: List[str] = []
    seen = set()
    for item in required_skills + preferred_skills + all_skills:
        if item.lower() not in seen:
            seen.add(item.lower())
            keywords.append(item)

    return {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "responsibilities": responsibilities,
        "qualifications": qualifications,
        "keywords": keywords,
        "raw_sections": raw_sections,
    }


class JobAnalyzer:
    """Analyzer class for extracting structured information from plain-text job descriptions."""

    def analyze(self, text: str) -> Dict[str, Any]:
        """Analyzes a plain-text job description and returns structured data."""
        return analyze_job(text)


__all__ = ["analyze_job", "JobAnalyzer"]
