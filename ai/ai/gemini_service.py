import os
import json
from google import genai


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    return genai.Client(api_key=api_key)


def generate_ai_analysis(resume_data, job_data, match_result):
    client = get_gemini_client()

    prompt = f"""
You are an expert ATS resume analyzer, technical recruiter,
career coach, and interview preparation assistant.

Analyze the following candidate resume and target job information.

RESUME DATA:
{json.dumps(resume_data, indent=2)}

JOB DATA:
{json.dumps(job_data, indent=2)}

EXISTING MATCH ANALYSIS:
{json.dumps(match_result, indent=2)}

Generate an accurate and personalized analysis.

IMPORTANT RULES:
1. Never invent information about the candidate.
2. Use only information present in the supplied resume.
3. Clearly distinguish existing skills from missing skills.
4. Make recommendations practical and specific.
5. Keep the match score from the existing analysis.
6. Return ONLY valid JSON.
7. Do not use Markdown.
8. Do not put JSON inside ``` blocks.

Return exactly this structure:

{
  "feedback": "Detailed resume and job-match feedback",
  "skillsGapExplanation": [
    "Explanation of important missing or weak skills and why they matter"
  ],
  "improvements": [
    "Specific actionable resume improvement"
  ],
  "hrReview": {
    "summary": "Recruiter-style candidate summary",
    "strengths": [
      "Candidate strength"
    ],
    "concerns": [
      "Recruiter concern"
    ],
    "recommendation": "Recruiter recommendation based on the supplied evidence"
  },
  "interviewPreparation": [
    {
      "category": "Technical",
      "question": "Interview question",
      "guidance": "How the candidate should prepare"
    }
  ]
}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        }
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return json.loads(response.text)