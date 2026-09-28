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
    Calls Gemini (via OpenAI SDK) to generate resume improvements, HR review, and interview questions.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    model_name = "gemini-3.8-flash"

    # Fallback to error format if missing API key
    if not api_key:
        logger.error("missing Gemini API key")
        return _fallback_response(resume_data, job_data, match_result, reason="missing_api_key")

    try:
        from openai import OpenAI, APIError, APITimeoutError, RateLimitError
        client = OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            max_retries=0
        )
        
        system_instruction = (
            "You are a technical recruiter. Analyze the resume against the job description.\n"
            "Keep output concise. Return valid JSON only with exactly three keys: 'improvements', 'hrReview', and 'interviewQuestions'."
        )

        prompt = (
            "Based on the following data, generate JSON containing exactly three keys: 'improvements', 'hrReview', and 'interviewQuestions'.\n"
            "The JSON must strictly match this structure:\n"
            "{\n"
            '  "improvements": ["maximum 5 specific recommendations"],\n'
            '  "hrReview": {\n'
            '    "summary": "concise summary",\n'
            '    "strengths": ["..."],\n'
            '    "concerns": ["..."],\n'
            '    "recommendation": "..."\n'
            "  },\n"
            '  "interviewQuestions": [\n'
            "    {\n"
            '      "category": "...",\n'
            '      "question": "...",\n'
            '      "guidance": "..."\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Generate maximum 5 improvements and maximum 5 interview questions.\n\n"
            "RESUME:\n"
            f"{resume_text}\n\n"
            "JOB DESCRIPTION:\n"
            f"{job_description_text}\n\n"
            "DETERMINISTIC ANALYSIS:\n"
            f"{json.dumps(match_result)}"
        )

        try:
            print("[LLM] Gemini request started")
            
            import time
            llm_t0 = time.time()
            # EXACTLY ONE CALL
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                reasoning_effort="low",
                max_tokens=700,
                timeout=8
            )
            llm_duration = int((time.time() - llm_t0) * 1000)
            
            print(f"[LLM] Gemini request completed: {llm_duration} ms")
            
            result = json.loads(response.choices[0].message.content)
            
            # Verify required keys
            required_keys = ["improvements", "hrReview", "interviewQuestions"]
            for k in required_keys:
                if k not in result:
                    result[k] = [] if k in ["improvements", "interviewQuestions"] else {}
                
            # Verify match score wasn't altered
            result["hrReview"]["matchScore"] = match_result.get("matchScore", 0)
            
            print(f"[LLM] Gemini requests for this analysis: 1")
            
            result["llmMetadata"] = {
                "provider": "Gemini",
                "model": model_name,
                "used": True,
                "source": "gemini"
            }
            
            result["generatedFeatures"] = {
                "improvements": True,
                "hrReview": True,
                "interviewQuestions": True
            }
                
            return result
            
        except RateLimitError as e:
            print("[LLM] Gemini quota exhausted")
            print("[LLM] Using deterministic fallback")
            return _fallback_response(resume_data, job_data, match_result, reason="rate_limit_exceeded")
        except APITimeoutError as e:
            print("[LLM] Gemini request timed out")
            print("[LLM] Using deterministic fallback")
            return _fallback_response(resume_data, job_data, match_result, reason="timeout")
        except APIError as e:
            print(f"[LLM] Gemini request failed: {str(e)}")
            print("[LLM] Using deterministic fallback")
            return _fallback_response(resume_data, job_data, match_result, reason="api_error")
        except Exception as e:
            print(f"[LLM] Gemini request failed: {str(e)}")
            print("[LLM] Using deterministic fallback")
            return _fallback_response(resume_data, job_data, match_result, reason="unexpected_error")

    except Exception as e:
        print(f"[LLM] Gemini request failed: {str(e)}")
        return _fallback_response(resume_data, job_data, match_result, reason="setup_failed")

def _fallback_response(resume_data: Dict[str, Any], job_data: Dict[str, Any], match_result: Dict[str, Any], reason: str = "api_error") -> Dict[str, Any]:
    from resume_improver import ResumeImprover
    from hr_reviewer import HRReviewer
    from interview_generator import InterviewQuestionGenerator
    import os
    
    print("[LLM] LLM source: deterministic_fallback")
    print("[LLM] Gemini-generated improvements: NO")
    print("[LLM] Gemini-generated hrReview: NO")
    print("[LLM] Gemini-generated interviewQuestions: NO")
    
    model_name = "gemini-3.8-flash"
    
    return {
        "improvements": ResumeImprover().generate(resume_data, job_data, match_result),
        "hrReview": HRReviewer().generate(resume_data, job_data, match_result),
        "interviewQuestions": InterviewQuestionGenerator().generate(resume_data, job_data, match_result),
        "llmMetadata": {
            "provider": "Gemini",
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
