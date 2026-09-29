const analyzeResumeAgainstJob = async (resumeText, jobDescriptionText) => {
  if (!process.env.PYTHON_AI_URL) {
    throw new Error('PYTHON_AI_URL is missing. Please configure it in your .env file.');
  }
  const pythonApiUrl = `${process.env.PYTHON_AI_URL}/api/analyze`;

  try {
    const response = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText,
        jobDescriptionText
      })
    });

    if (!response.ok) {
      const errText = await response.text();

      const error = new Error(
        `Python AI service returned status: ${response.status} - ${errText}`
      );
      error.isPythonServiceError = true;
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
    console.error(
      'AI Service Integration Error:',
      error.message
    );

    if (error.isPythonServiceError) {
      throw error;
    }

    throw new Error(
      'Failed to reach Python AI service. Please ensure the Python AI service is running. Details: ' + error.message
    );
  }
};

module.exports = {
  analyzeResumeAgainstJob
};