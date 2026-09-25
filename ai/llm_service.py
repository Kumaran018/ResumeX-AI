import os
import json
from google import genai
from google.genai import types

def analyze_with_llm(resume_text: str, job_description: str, deterministic_analysis: dict) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"available": False, "message": "LLM analysis is temporarily unavailable."}
    
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
You are an expert technical recruiter and career coach.
Analyze the provided resume and job description along with the deterministic analysis results.
Provide deep, specific, and actionable insights based ONLY on the actual provided resume and job description.
Do not invent or hallucinate any skills or experience.

Resume:
{resume_text}

Job Description:
{job_description}

Deterministic Analysis Results:
{json.dumps(deterministic_analysis, indent=2)}

You must return a valid JSON object that exactly matches this schema:
{{
  "professionalSummary": "A short professional summary of the candidate's fit.",
  "candidateStrengths": ["Strength 1 based on evidence", "Strength 2..."],
  "skillReasoning": ["Explanation of why a specific skill is strong or weak based on evidence", "..."],
  "resumeImprovementReasoning": ["Specific improvement suggestion with 'why' and 'how'", "..."],
  "interviewPreparation": ["A specific behavioral or technical question to prepare for, and why", "..."],
  "hrInsights": "A recruiter-style explanation of candidate alignment.",
  "learningRecommendations": ["Specific skills or tools to learn and a suggested small project", "..."]
}}
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"available": False, "message": "LLM analysis is temporarily unavailable."}
