"""
Test Suite for ResumeX-AI Core Modules.

Tests:
1. Basic Test: Single resume and job analysis from the team prompt.
   - Resume Analysis (resume_analyzer.py)
   - Job Analysis (job_analyzer.py)
   - Evidence Analysis (evidence_analyzer.py)
   - Matcher (matcher.py)
   - Resume Improvement Suggestions
   - HR Recruiter Review
   - Personalized Interview Questions
   - STEP 11: Final Consistent JSON Output (9 Top-Level Fields)
2. Combination Tests: 4 test-data combinations covering different skill and evidence cases.
   - resume1.txt + job1.txt
   - resume1.txt + job2.txt
   - resume2.txt + job1.txt
   - resume3.txt + job2.txt
3. STEP 12: PDF Resume Testing.
   - PDF Text Extraction (pdf_extractor.py)
   - End-to-End AI Pipeline on PDF Resume
   - Verification of Final 9-Field JSON Output
"""

import json
import os
import re
import sys
from typing import Any, Dict, List

# Ensure repository root is on sys.path regardless of execution directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.evidence_analyzer import EvidenceAnalyzer, analyze_evidence
from ai.hr_reviewer import HRReviewer, generate_hr_review
from ai.interview_generator import InterviewQuestionGenerator, generate_interview_questions
from ai.job_analyzer import JobAnalyzer, analyze_job
from ai.matcher import (
    FINAL_TOP_LEVEL_KEYS,
    Matcher,
    generate_final_json,
    generate_hr_review,
    generate_interview_questions,
    generate_resume_improvements,
    match_resume_to_job,
)
from ai.pdf_extractor import PDFExtractor, extract_text_from_pdf
from ai.resume_analyzer import ResumeAnalyzer, analyze_resume, analyze_resume_pdf
from ai.resume_improver import ResumeImprover, generate_resume_improvements



# Sample Resume from the team prompt
SAMPLE_RESUME = """
Jane Doe
jane.doe@email.com

SKILLS
Python, Docker, SQL, Ruby

EXPERIENCE
Senior Software Engineer - Acme Corp (2021 - Present)
- Built high-performance microservices using Python and FastAPI.
- Designed database schemas in PostgreSQL.

EDUCATION
B.S. in Computer Science - State University (2017 - 2021)

PROJECTS
ResumeX AI
- Built full-stack resume analysis application using Python and React.

CERTIFICATIONS
AWS Certified Developer
"""

# Sample Job Description from the team prompt
SAMPLE_JOB_DESCRIPTION = """
Backend Engineer

Responsibilities:
- Build scalable REST APIs in Python.
- Maintain Docker containers and AWS cloud infrastructure.

Requirements:
- Strong proficiency in Python and FastAPI.
- Experience with Docker and PostgreSQL.

Preferred Qualifications:
- Experience with AWS and Kubernetes.
- Knowledge of GraphQL.
"""


def test_ai() -> None:
    """Runs end-to-end testing of all AI modules and prints structured output."""

    # 1. Resume Analysis
    resume_analyzer = ResumeAnalyzer()
    resume_data = resume_analyzer.analyze(SAMPLE_RESUME)

    print("=" * 60)
    print("RESUME ANALYSIS")
    print("=" * 60)
    print(f"Skills: {resume_data.get('skills', [])}")
    print(f"Education: {resume_data.get('education', [])}")
    print(f"Experience: {resume_data.get('experience', [])}")
    print(f"Projects: {resume_data.get('projects', [])}")
    print(f"Certifications: {resume_data.get('certifications', [])}")

    # 2. Job Analysis
    job_analyzer = JobAnalyzer()
    job_data = job_analyzer.analyze(SAMPLE_JOB_DESCRIPTION)

    print("\n" + "=" * 60)
    print("JOB ANALYSIS")
    print("=" * 60)
    print(f"Required Skills: {job_data.get('required_skills', [])}")
    print(f"Preferred Skills: {job_data.get('preferred_skills', [])}")
    print(f"Responsibilities: {job_data.get('responsibilities', [])}")
    print(f"Qualifications: {job_data.get('qualifications', [])}")
    print(f"Keywords: {job_data.get('keywords', [])}")

    # 3. Evidence Analysis
    evidence_analyzer = EvidenceAnalyzer()
    evidence_data = evidence_analyzer.analyze(job_data, resume_data)

    print("\n" + "=" * 60)
    print("EVIDENCE ANALYSIS")
    print("=" * 60)
    for skill, data in evidence_data.items():
        strength = data.get("strength")
        mentioned = data.get("mentioned")
        has_evidence = data.get("evidence")
        evidence_text = data.get("evidence_text", "").replace("\n", " | ")
        print(f"- {skill}:")
        print(f"    Strength: {strength}")
        print(f"    Mentioned: {mentioned}")
        print(f"    Evidence: {has_evidence}")
        if evidence_text:
            print(f"    Evidence Text: {evidence_text}")

    # 4. Matcher
    matcher = Matcher()
    match_result = matcher.match(resume_data, job_data)

    # SKILL GAPS
    print("\n" + "=" * 60)
    print("SKILL GAPS")
    print("=" * 60)
    print(f"Missing Skills: {match_result.get('missingSkills', [])}")
    print(f"Weak Evidence Skills: {match_result.get('weakEvidence', [])}")

    # MATCH RESULT
    print("\n" + "=" * 60)
    print("MATCH RESULT")
    print("=" * 60)
    print(f"Match Score: {match_result.get('matchScore')}%")
    print(f"Matching Skills: {match_result.get('matching_skills', [])}")
    print(f"Strong Skills: {match_result.get('strongSkills', [])}")
    print(f"Weak Evidence: {match_result.get('weakEvidence', [])}")
    print(f"Missing Skills: {match_result.get('missingSkills', [])}")

    # 5. Resume Improvement Suggestions
    improvements = generate_resume_improvements(resume_data, job_data, match_result)
    print("\n" + "=" * 60)
    print("RESUME IMPROVEMENTS")
    print("=" * 60)
    for idx, suggestion in enumerate(improvements, start=1):
        print(f"{idx}. {suggestion}")

    # 6. HR Recruiter Review
    hr_review = generate_hr_review(resume_data, job_data, match_result)
    print("\n" + "=" * 60)
    print("HR REVIEW")
    print("=" * 60)
    print(f"Candidate: {hr_review['candidateName']}")
    print(f"Target Role: {hr_review['targetRole']}")
    print(f"Match Score: {hr_review['matchScore']}%")
    print(f"Recommendation: {hr_review['recommendation']}")
    print(f"Executive Summary: {hr_review['summary']}")
    print("Key Strengths:")
    for strength in hr_review["strengths"]:
        print(f"  - {strength}")
    print("Areas of Concern:")
    for concern in hr_review["concerns"]:
        print(f"  - {concern}")

    # 7. Personalized Interview Questions
    questions = generate_interview_questions(resume_data, job_data, match_result)
    print("\n" + "=" * 60)
    print("INTERVIEW QUESTIONS")
    print("=" * 60)
    for idx, q in enumerate(questions, start=1):
        print(f"{idx}. [{q['category']}] {q['question']}")
        print(f"   Guidance: {q['guidance']}")

    # 8. STEP 11: Final Consistent JSON Structure
    final_json = generate_final_json(resume_data, job_data)
    print("\n" + "=" * 60)
    print("FINAL CONSISTENT JSON OUTPUT (9 TOP-LEVEL FIELDS)")
    print("=" * 60)
    print(json.dumps(final_json, indent=2))

    # Validations & Assertions
    assert "Python" in resume_data["skills"], "Python should be detected in resume skills"
    assert len(resume_data["education"]) > 0, "Education should be extracted"
    assert len(resume_data["experience"]) > 0, "Experience should be extracted"
    assert len(resume_data["projects"]) > 0, "Projects should be extracted"

    assert "Python" in job_data["required_skills"], "Python should be a required skill"
    assert "FastAPI" in job_data["required_skills"], "FastAPI should be a required skill"
    assert "AWS" in job_data["preferred_skills"], "AWS should be a preferred skill"

    assert evidence_data["Python"]["strength"] == "Strong", "Python should have Strong evidence"
    assert evidence_data["Docker"]["strength"] == "Weak", "Docker should have Weak evidence"
    assert evidence_data["Kubernetes"]["strength"] == "Missing", "Kubernetes should be Missing"

    assert 0 <= match_result["matchScore"] <= 100, "Match score must be between 0 and 100"
    assert "Python" in match_result["strongSkills"], "Python should be in strongSkills"
    assert "Docker" in match_result["weakEvidence"], "Docker should be in weakEvidence"
    assert "Kubernetes" in match_result["missingSkills"], "Kubernetes should be in missingSkills"
    assert "GraphQL" in match_result["missingSkills"], "GraphQL should be in missingSkills"

    assert len(improvements) > 0, "Resume improvements should be generated"
    assert "recommendation" in hr_review, "HR review must contain recommendation"
    assert len(questions) > 0, "Interview questions should be generated"

    # Assert exactly the 9 required top-level fields
    assert set(final_json.keys()) == set(FINAL_TOP_LEVEL_KEYS), (
        f"Final JSON keys mismatch: expected {FINAL_TOP_LEVEL_KEYS}, got {list(final_json.keys())}"
    )
    assert isinstance(final_json["matchScore"], (int, float))
    assert isinstance(final_json["strongSkills"], list)
    assert isinstance(final_json["weakEvidence"], list)
    assert isinstance(final_json["missingSkills"], list)
    assert isinstance(final_json["keywordAnalysis"], dict)
    assert isinstance(final_json["formatting"], dict)
    assert isinstance(final_json["improvements"], list)
    assert isinstance(final_json["hrReview"], dict)
    assert isinstance(final_json["interviewQuestions"], list)

    print("\n" + "=" * 60)
    print("BASIC TEST PASSED SUCCESSFULLY!")
    print("=" * 60)


def test_combinations() -> None:
    """
    Tests 4 test-data combinations:
    1. resume1.txt + job1.txt
    2. resume1.txt + job2.txt
    3. resume2.txt + job1.txt
    4. resume3.txt + job2.txt
    """
    test_data_dir = os.path.join(os.path.dirname(__file__), "test-data")

    combinations = [
        ("resume1.txt", "job1.txt"),
        ("resume1.txt", "job2.txt"),
        ("resume2.txt", "job1.txt"),
        ("resume3.txt", "job2.txt"),
    ]

    print("\n" + "=" * 60)
    print("TEST DATA COMBINATIONS")
    print("=" * 60)

    resume_analyzer = ResumeAnalyzer()
    job_analyzer = JobAnalyzer()
    evidence_analyzer = EvidenceAnalyzer()
    matcher = Matcher()

    for idx, (resume_file, job_file) in enumerate(combinations, start=1):
        resume_path = os.path.join(test_data_dir, resume_file)
        job_path = os.path.join(test_data_dir, job_file)

        if not os.path.exists(resume_path) or not os.path.exists(job_path):
            print(f"Skipping {resume_file} + {job_file} (files not found)")
            continue

        with open(resume_path, "r", encoding="utf-8") as rf:
            resume_text = rf.read()

        with open(job_path, "r", encoding="utf-8") as jf:
            job_text = jf.read()

        # Run AI modules
        resume_data = resume_analyzer.analyze(resume_text)
        job_data = job_analyzer.analyze(job_text)
        evidence_data = evidence_analyzer.analyze(job_data, resume_data)
        match_result = matcher.match(resume_data, job_data)
        combo_json = matcher.match_json(resume_data, job_data)

        print(f"\n--- Combination {idx}: {resume_file} + {job_file} ---")
        print(f"Match Score: {match_result.get('matchScore')}%")
        print(f"Strong Skills: {match_result.get('strongSkills', [])}")
        print(f"Weak Evidence: {match_result.get('weakEvidence', [])}")
        print(f"Missing Skills: {match_result.get('missingSkills', [])}")

        # Assertions to ensure valid structure and scoring
        assert 0 <= match_result["matchScore"] <= 100, f"Match score invalid for {resume_file} + {job_file}"
        assert isinstance(match_result["strongSkills"], list)
        assert isinstance(match_result["weakEvidence"], list)
        assert isinstance(match_result["missingSkills"], list)
        assert isinstance(evidence_data, dict)

        # Assert all 9 fields exist in combination output as well
        assert set(combo_json.keys()) == set(FINAL_TOP_LEVEL_KEYS)

    print("\n" + "=" * 60)
    print("ALL COMBINATIONS TESTED SUCCESSFULLY!")
    print("=" * 60)


def test_pdf_resumes() -> None:
    """
    STEP 12: Tests PDF text extraction and end-to-end AI matching pipeline with PDF resumes.
    Tests all three PDF resumes:
    - resume1.pdf (tested against job1.txt)
    - resume2.pdf (tested against job2.txt)
    - resume3.pdf (tested against job1.txt)

    For each PDF:
    1. Extracts text from PDF
    2. Passes extracted text through Resume Analyzer
    3. Runs Job Analyzer, Evidence Analyzer, and Matcher
    4. Validates and displays the final 9-field JSON output
    """
    test_data_dir = os.path.join(os.path.dirname(__file__), "test-data")

    pdf_test_cases = [
        ("resume1.pdf", "job1.txt"),
        ("resume2.pdf", "job2.txt"),
        ("resume3.pdf", "job1.txt"),
    ]

    print("\n" + "=" * 60)
    print("STEP 12: ALL 3 PDF RESUMES EXTRACTION & PIPELINE TEST")
    print("=" * 60)

    extractor = PDFExtractor()
    resume_analyzer = ResumeAnalyzer()
    job_analyzer = JobAnalyzer()
    matcher = Matcher()

    for idx, (pdf_file, job_file) in enumerate(pdf_test_cases, start=1):
        pdf_path = os.path.join(test_data_dir, pdf_file)
        job_path = os.path.join(test_data_dir, job_file)

        print(f"\n[{idx}/3] TESTING PDF RESUME: {pdf_file} with {job_file}")
        print("-" * 60)

        if not os.path.exists(pdf_path) or not os.path.exists(job_path):
            print(f"Skipping PDF {pdf_file} (files not found)")
            continue

        # 1. Extract text from PDF
        extracted_text = extractor.extract(pdf_path)
        print(f"Extraction Successful! Extracted {len(extracted_text)} characters.")
        print("EXTRACTED TEXT PREVIEW:")
        preview_lines = extracted_text.splitlines()[:10]
        print("\n".join(preview_lines))
        if len(extracted_text.splitlines()) > 10:
            print("... [remaining text truncated for display]")
        print("-" * 60)

        # 2. Pass extracted text through existing Resume Analyzer
        resume_data = resume_analyzer.analyze(extracted_text)

        # 3. Use existing Job Analyzer
        with open(job_path, "r", encoding="utf-8") as jf:
            job_data = job_analyzer.analyze(jf.read())

        # 4. Use existing Matcher to produce the final 9-field JSON
        final_pdf_json = matcher.match_json(resume_data, job_data)

        print(f"FINAL JSON OUTPUT FOR {pdf_file} (9 TOP-LEVEL FIELDS):")
        print(json.dumps(final_pdf_json, indent=2))

        # Assertions
        assert len(extracted_text) > 0, f"Extracted text for {pdf_file} must not be empty"
        assert len(resume_data.get("skills", [])) > 0, f"Resume skills should be extracted from {pdf_file}"

        # Assert all 9 top-level fields
        assert set(final_pdf_json.keys()) == set(FINAL_TOP_LEVEL_KEYS), (
            f"PDF Final JSON keys mismatch for {pdf_file}: {set(final_pdf_json.keys()) ^ set(FINAL_TOP_LEVEL_KEYS)}"
        )
        assert isinstance(final_pdf_json["matchScore"], (int, float))
        assert isinstance(final_pdf_json["strongSkills"], list)
        assert isinstance(final_pdf_json["weakEvidence"], list)
        assert isinstance(final_pdf_json["missingSkills"], list)
        assert isinstance(final_pdf_json["keywordAnalysis"], dict)
        assert isinstance(final_pdf_json["formatting"], dict)
        assert isinstance(final_pdf_json["improvements"], list)
        assert isinstance(final_pdf_json["hrReview"], dict)
        assert isinstance(final_pdf_json["interviewQuestions"], list)

    print("\n" + "=" * 60)
    print("ALL 3 PDF RESUMES TESTED AND VERIFIED SUCCESSFULLY!")
    print("=" * 60)


def test_three_features() -> None:
    """
    STEP 10: Dedicated Unit Test Cases for the 3 Remaining AI Features:
    1. Resume Improvements (ai.resume_improver.ResumeImprover)
    2. HR Recruiter Review (ai.hr_reviewer.HRReviewer)
    3. Personalized Interview Questions (ai.interview_generator.InterviewQuestionGenerator)
    """
    print("\n" + "=" * 60)
    print("STEP 10: TESTING 3 REMAINING AI FEATURES")
    print("=" * 60)

    improver = ResumeImprover()
    reviewer = HRReviewer()
    question_gen = InterviewQuestionGenerator()

    # Synthetic test inputs to test diverse edge cases
    mock_resume = {
        "skills": ["Python", "Docker"],
        "education": ["B.S. in Computer Science"],
        "experience": ["Software Engineer at TechCorp - built REST APIs"],
        "projects": ["Web Scraper - automated data collection"],
        "certifications": ["AWS Solutions Architect"],
        "raw_sections": {
            "header": "Alex Mercer\nalex@example.com",
        },
    }

    mock_job = {
        "required_skills": ["Python", "FastAPI", "PostgreSQL"],
        "preferred_skills": ["Kubernetes", "GraphQL"],
        "responsibilities": ["Build cloud services"],
        "qualifications": ["Bachelor's degree"],
        "keywords": ["Python", "FastAPI", "PostgreSQL", "Kubernetes", "GraphQL"],
        "raw_sections": {
            "about": "Senior Backend Developer\nJoin our cloud platform team",
        },
    }

    mock_match = {
        "matchScore": 65.0,
        "strongSkills": ["Python"],
        "weakEvidence": ["Docker"],
        "missingSkills": ["FastAPI", "PostgreSQL", "Kubernetes"],
    }

    # 1. Feature 1: Resume Improvements
    print("\n--- 1. Testing Resume Improvements ---")
    improvements = improver.generate(mock_resume, mock_job, mock_match)
    fn_improvements = generate_resume_improvements(mock_resume, mock_job, mock_match)

    assert isinstance(improvements, list), "Improvements should be a list"
    assert len(improvements) >= 3, "Should have at least 3 distinct improvement recommendations"
    assert improvements == fn_improvements, "Class method and functional helper should match"

    # Assert weak evidence recommendation
    has_weak_rec = any("Docker" in s and "concrete project or work experience" in s for s in improvements)
    assert has_weak_rec, "Must suggest improving evidence for weak skill 'Docker'"

    # Assert missing skills recommendation
    has_missing_rec = any("missing required skills" in s for s in improvements)
    assert has_missing_rec, "Must suggest addressing missing required skills"

    # Assert metrics quantification recommendation (mock_resume has no numbers in experience)
    has_metrics_rec = any("Quantify your achievements" in s for s in improvements)
    assert has_metrics_rec, "Must suggest quantifying achievements with metrics"

    # Assert role tailoring recommendation
    has_tailoring_rec = any("Senior Backend Developer" in s for s in improvements)
    assert has_tailoring_rec, "Must suggest tailoring for the target job role"

    print(f"PASSED: Generated {len(improvements)} actionable resume improvement suggestions.")
    for i, s in enumerate(improvements, 1):
        print(f"  {i}. {s}")

    # 2. Feature 2: HR Recruiter Review
    print("\n--- 2. Testing HR Recruiter Review ---")
    hr_review = reviewer.review(mock_resume, mock_job, mock_match)
    fn_hr_review = generate_hr_review(mock_resume, mock_job, mock_match)

    required_hr_keys = ["candidateName", "targetRole", "matchScore", "recommendation", "summary", "strengths", "concerns"]
    for key in required_hr_keys:
        assert key in hr_review, f"HR review missing required key: {key}"
    assert hr_review == fn_hr_review, "Class review and functional helper should match"

    assert hr_review["candidateName"] == "Alex Mercer"
    assert hr_review["targetRole"] == "Senior Backend Developer"
    assert hr_review["matchScore"] == 65.0
    assert "Moderate Match" in hr_review["recommendation"]
    assert len(hr_review["strengths"]) >= 1
    assert len(hr_review["concerns"]) >= 1
    assert any("Python" in s for s in hr_review["strengths"])
    assert any("Docker" in c for c in hr_review["concerns"])

    # Test recommendation score thresholds (High >= 75, Low < 50)
    high_match = dict(mock_match, matchScore=85.0)
    high_review = reviewer.review(mock_resume, mock_job, high_match)
    assert "Strong Candidate" in high_review["recommendation"]

    low_match = dict(mock_match, matchScore=30.0)
    low_review = reviewer.review(mock_resume, mock_job, low_match)
    assert "Low Match" in low_review["recommendation"]

    print("PASSED: HR Review correctly generated with executive summary, strengths, and concerns.")
    print(f"  Candidate: {hr_review['candidateName']}")
    print(f"  Target Role: {hr_review['targetRole']}")
    print(f"  Recommendation: {hr_review['recommendation']}")

    # 3. Feature 3: Personalized Interview Questions
    print("\n--- 3. Testing Personalized Interview Questions ---")
    questions = question_gen.generate(mock_resume, mock_job, mock_match)
    fn_questions = generate_interview_questions(mock_resume, mock_job, mock_match)

    assert isinstance(questions, list), "Questions must be returned as a list"
    assert len(questions) >= 3, "Must generate at least 3 targeted questions"
    assert questions == fn_questions, "Class generate and functional helper should match"

    for q in questions:
        assert "category" in q, "Question must have a 'category'"
        assert "question" in q, "Question must have a 'question' text"
        assert "guidance" in q, "Question must have a 'guidance' explanation"
        assert len(q["question"]) > 10, "Question text should be substantive"
        assert len(q["guidance"]) > 10, "Context explanation should be substantive"

    categories = [q["category"] for q in questions]
    assert "Technical Deep Dive" in categories, "Must include Technical Deep Dive category"
    assert "Skill Verification" in categories, "Must include Skill Verification category for weak skills"
    assert "Adaptability & Skill Gaps" in categories, "Must include Adaptability category for missing skills"

    print(f"PASSED: Generated {len(questions)} personalized interview questions across categories: {list(set(categories))}.")
    for i, q in enumerate(questions, 1):
        print(f"  {i}. [{q['category']}] {q['question']}")

    print("\n" + "=" * 60)
    print("STEP 10: ALL 3 NEW FEATURES TESTED & ASSERTIONS PASSED (100%)!")
    print("=" * 60)


if __name__ == "__main__":
    test_ai()
    test_three_features()
    test_combinations()
    test_pdf_resumes()

