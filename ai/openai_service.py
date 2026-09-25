import os
import json
import logging
import time
from typing import Any, Dict

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass

logger = logging.getLogger(__name__)

def get_openai_insights(
    resume_text: str,
    job_description_text: str,
    match_result: Dict[str, Any],
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calls OpenAI to generate resume improvements, HR review, and interview questions.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o")

    # Fallback to error format if missing API key
    if not api_key:
        logger.error("missing OpenAI API key")
        return _fallback_response(resume_data, job_data, match_result, reason="missing_api_key")

    try:
        from openai import OpenAI, APIError, APITimeoutError, RateLimitError
        client = OpenAI(api_key=api_key)
        
        system_instruction = (
            "You are an experienced technical recruiter and resume analyst.\n"
            "Analyze the candidate resume against the target job description.\n"
            "Use ONLY the supplied resume and job information.\n"
            "Do not invent experience, certifications, projects, skills, employers, achievements, or qualifications.\n"
            "Generate three outputs:\n"
            "1. Resume improvement recommendations\n"
            "2. Recruiter/HR evaluation\n"
            "3. Personalized technical and behavioral interview questions\n"
            "The recommendations must be specific to the candidate and target role.\n"
            "Interview questions must be based on:\n"
            "- demonstrated skills\n"
            "- weak evidence\n"
            "- missing job requirements\n"
            "- projects actually present in the resume\n"
            "Return valid JSON only."
        )

        prompt = (
            "Based on the following data, generate JSON containing exactly three keys: 'improvements', 'hrReview', and 'interviewQuestions'.\n"
            "The JSON must strictly match this structure:\n"
            "{\n"
            '  "improvements": [\n'
            '    "specific recommendation 1",\n'
            '    "specific recommendation 2"\n'
            "  ],\n"
            '  "hrReview": {\n'
            '    "summary": "...",\n'
            '    "strengths": [\n'
            '      "..."\n'
            '    ],\n'
            '    "concerns": [\n'
            '      "..."\n'
            '    ],\n'
            '    "recommendation": "..."\n'
            "  },\n"
            '  "interviewQuestions": [\n'
            "    {\n"
            '      "category": "Technical Deep Dive",\n'
            '      "question": "...",\n'
            '      "guidance": "..."\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "The matchScore MUST remain exactly the score provided below.\n\n"
            f"Resume Text: {resume_text}\n\n"
            f"Job Description Text: {job_description_text}\n\n"
            f"Resume Data: {json.dumps(resume_data)}\n\n"
            f"Job Data: {json.dumps(job_data)}\n\n"
            f"Deterministic Match Results: {json.dumps(match_result)}"
        )

        try:
            print("[LLM] OpenAI request started")
            
            # EXACTLY ONE CALL
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                timeout=20.0  # reasonable request timeout, no long retries
            )
            
            print("[LLM] OpenAI request succeeded")
            
            result = json.loads(response.choices[0].message.content)
            
            # Verify required keys
            if "improvements" not in result or "hrReview" not in result or "interviewQuestions" not in result:
                raise ValueError("Malformed OpenAI response: missing required keys")
                
            # Verify match score wasn't altered
            result["hrReview"]["matchScore"] = match_result.get("matchScore", 0)
            
            print(f"[LLM] OpenAI-generated improvements: {'YES' if 'improvements' in result else 'NO'}")
            print(f"[LLM] OpenAI-generated hrReview: {'YES' if 'hrReview' in result else 'NO'}")
            print(f"[LLM] OpenAI-generated interviewQuestions: {'YES' if 'interviewQuestions' in result else 'NO'}")
            
            result["llmMetadata"] = {
                "provider": "OpenAI",
                "model": model_name,
                "used": True,
                "source": "openai"
            }
            
            result["generatedFeatures"] = {
                "improvements": True,
                "hrReview": True,
                "interviewQuestions": True
            }
                
            return result
            
        except RateLimitError as e:
            print(f"[LLM] OpenAI request failed: {str(e)}")
            return _fallback_response(resume_data, job_data, match_result, reason="rate_limit_exceeded")
        except APITimeoutError as e:
            print(f"[LLM] OpenAI request failed: {str(e)}")
            return _fallback_response(resume_data, job_data, match_result, reason="timeout")
        except APIError as e:
            print(f"[LLM] OpenAI request failed: {str(e)}")
            return _fallback_response(resume_data, job_data, match_result, reason="openai_api_error")
        except Exception as e:
            print(f"[LLM] OpenAI request failed: {str(e)}")
            return _fallback_response(resume_data, job_data, match_result, reason="unexpected_error")

    except Exception as e:
        print(f"[LLM] OpenAI request failed: {str(e)}")
        return _fallback_response(resume_data, job_data, match_result, reason="openai_setup_failed")

def _fallback_response(resume_data: Dict[str, Any], job_data: Dict[str, Any], match_result: Dict[str, Any], reason: str = "openai_api_error") -> Dict[str, Any]:
    from ai.resume_improver import ResumeImprover
    from ai.hr_reviewer import HRReviewer
    from ai.interview_generator import InterviewQuestionGenerator
    import os
    
    print("[LLM] LLM source: deterministic_fallback")
    print("[LLM] OpenAI-generated improvements: NO")
    print("[LLM] OpenAI-generated hrReview: NO")
    print("[LLM] OpenAI-generated interviewQuestions: NO")
    
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o")
    
    return {
        "improvements": ResumeImprover().generate(resume_data, job_data, match_result),
        "hrReview": HRReviewer().generate(resume_data, job_data, match_result),
        "interviewQuestions": InterviewQuestionGenerator().generate(resume_data, job_data, match_result),
        "llmMetadata": {
            "provider": "OpenAI",
            "model": model_name,
            "used": False,
            "source": "deterministic_fallback",
            "reason": reason
        },
        "generatedFeatures": {
            "improvements": False,
            "hrReview": False,
            "interviewQuestions": False
        }
    }
