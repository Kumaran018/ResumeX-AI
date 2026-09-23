// MOCK AI SERVICE
// This is structurally sound but outputs mock data.
// Replace with actual LLM calls (e.g., via LangChain or direct OpenAI/Gemini SDKs) in the future.

const analyzeResumeAgainstJob = async (resumeText, jobDescriptionText) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Determine mock score between 50 and 99
  const score = Math.floor(Math.random() * 50) + 50;

  return {
    score,
    feedback: "[MOCK DATA] The candidate shows a solid foundation. Some skills match well with the job description, although advanced toolsets mentioned in the job description appear to be missing from the resume text.",
    missingSkills: ["React Native", "GraphQL", "AWS"],  // Mocked missing skills
    matchingSkills: ["JavaScript", "Node.js", "Express"] // Mocked matching skills
  };
};

module.exports = { analyzeResumeAgainstJob };
