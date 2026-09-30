const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseErrorBody = async (response) => {
  try {
    const errText = await response.text();
    // Try to parse as JSON first (e.g. FastAPI HTTPException format)
    try {
      const errJson = JSON.parse(errText);
      if (errJson.detail) {
        return typeof errJson.detail === 'string'
          ? errJson.detail
          : JSON.stringify(errJson.detail);
      }
      if (errJson.message) return errJson.message;
    } catch {
      // Not JSON
    }

    // Check if response is raw HTML (e.g., Render/Cloudflare 502/503/504 error page)
    if (errText.includes('<!DOCTYPE') || errText.includes('<html') || errText.includes('<head>')) {
      if ([502, 503, 504].includes(response.status)) {
        return 'Service is waking up from sleep or temporarily unavailable. Please wait a moment and try again.';
      }
      return `Received HTML error page with HTTP status ${response.status}.`;
    }

    return errText.slice(0, 300).trim() || `HTTP ${response.status} error`;
  } catch (e) {
    return `HTTP ${response.status}`;
  }
};

const analyzeResumeAgainstJob = async (resumeText, jobDescriptionText) => {
  if (!process.env.PYTHON_AI_URL) {
    throw new Error('PYTHON_AI_URL is missing. Please configure it in your .env file.');
  }
  const pythonApiUrl = `${process.env.PYTHON_AI_URL}/api/analyze`;

  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If Render/Cloudflare returns a 502/503/504 (cold-start spin-up), retry after a short delay
      if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
        console.warn(
          `[AI Service] Attempt ${attempt + 1} returned status ${response.status}. Retrying in 5s (service may be waking up)...`
        );
        await sleep(5000);
        continue;
      }

      if (!response.ok) {
        const cleanErrMsg = await parseErrorBody(response);
        const error = new Error(
          `Python AI service returned status: ${response.status} - ${cleanErrMsg}`
        );
        error.isPythonServiceError = true;
        error.statusCode = response.status >= 500 ? 503 : response.status;
        throw error;
      }

      const aiResult = await response.json();

      return {
        score: aiResult.matchScore || aiResult.score || 0,

        feedback:
          aiResult.hrReview?.recommendation ||
          aiResult.hrReview?.feedback ||
          aiResult.feedback ||
          'Review completed.',

        missingSkills: aiResult.missingSkills || [],

        matchingSkills:
          aiResult.strongSkills ||
          aiResult.matchingSkills ||
          [],

        weakEvidence: aiResult.weakEvidence || [],

        keywordAnalysis: aiResult.keywordAnalysis || {},

        formatting: aiResult.formatting || {},

        improvements: aiResult.improvements || [],

        hrReview: aiResult.hrReview || {},

        interviewQuestions: aiResult.interviewQuestions || [],

        interviewPreparation:
          aiResult.interviewPreparation || []
      };
    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError' && attempt < maxRetries) {
        console.warn(`[AI Service] Attempt ${attempt + 1} timed out. Retrying...`);
        await sleep(3000);
        continue;
      }

      if (error.isPythonServiceError) {
        throw error;
      }

      if (attempt < maxRetries && !error.isPythonServiceError) {
        console.warn(`[AI Service] Connection attempt ${attempt + 1} failed: ${error.message}. Retrying...`);
        await sleep(4000);
        continue;
      }

      console.error('AI Service Integration Error:', error.message);
      throw new Error(
        'Failed to reach Python AI service. Details: ' + error.message
      );
    }
  }

  throw lastError || new Error('Failed to reach Python AI service after retries.');
};

module.exports = {
  analyzeResumeAgainstJob
};