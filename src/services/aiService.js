const analyzeResumeAgainstJob = async (resumeText, jobDescriptionText) => {
  const pythonApiUrl = process.env.PYTHON_AI_API_URL || "http://127.0.0.1:8000/api/analyze";
  
  try {
    const response = await fetch(pythonApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescriptionText }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Python AI service returned status: ${response.status} - ${errText}`);
    }

    const aiResult = await response.json();

    // Map properties and return new and backwards compatible fields
    return {
      score: aiResult.matchScore || 0,
      feedback: aiResult.hrReview?.recommendation || aiResult.hrReview?.feedback || "Review completed.",
      missingSkills: aiResult.missingSkills || [],
      matchingSkills: aiResult.strongSkills || aiResult.matchingSkills || [],
      
      weakEvidence: aiResult.weakEvidence || [],
      keywordAnalysis: aiResult.keywordAnalysis || {},
      formatting: aiResult.formatting || {},
      improvements: aiResult.improvements || [],
      hrReview: aiResult.hrReview || {},
      interviewQuestions: aiResult.interviewQuestions || []
    };
  } catch (error) {
    console.error("AI Service Integration Error:", error.message);
    throw new Error("Failed to reach Python AI service. Please ensure it is running.");
  }
};

module.exports = { analyzeResumeAgainstJob };
