const { pool } = require('../config/db');
const { analyzeResumeAgainstJob } = require('../services/aiService');
const { AppError, sendResponse } = require('../utils/errors');

exports.analyze = async (req, res, next) => {
  try {
    const { resumeId, jobId, forceRefresh } = req.body;

    if (!resumeId || !jobId) {
      return next(new AppError('Please provide both resumeId and jobId', 400));
    }

    const resumeResult = await pool.query('SELECT *, id AS _id FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, req.user.id]);
    const resume = resumeResult.rows[0];

    const jobResult = await pool.query('SELECT *, id AS _id FROM jobs WHERE id = $1 AND user_id = $2', [jobId, req.user.id]);
    const job = jobResult.rows[0];

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    if (!job) {
      return next(new AppError('Job Description not found', 404));
    }

    let analysis;
    let previousScore = null;

    const existingAnalysisResult = await pool.query(
      'SELECT *, id AS _id FROM analyses WHERE user_id = $1 AND resume_id = $2 AND job_id = $3',
      [req.user.id, resume.id, job.id]
    );

    if (existingAnalysisResult.rows.length > 0 && !forceRefresh) {
      // Return cached analysis
      analysis = existingAnalysisResult.rows[0];
    } else {
      // Call AI service only when necessary
      const aiResult = await analyzeResumeAgainstJob(
        resume.extracted_text,
        job.description
      );

      if (existingAnalysisResult.rows.length > 0) {
        analysis = existingAnalysisResult.rows[0];
        previousScore = analysis.score;

        const updateResult = await pool.query(
          `UPDATE analyses SET 
            score = $1, feedback = $2, missing_skills = $3, matching_skills = $4, weak_evidence = $5,
            keyword_analysis = $6, formatting = $7, improvements = $8, hr_review = $9,
            interview_questions = $10, interview_preparation = $11, updated_at = CURRENT_TIMESTAMP
           WHERE id = $12 RETURNING *, id AS _id`,
          [
            aiResult.score, aiResult.feedback, aiResult.missingSkills, aiResult.matchingSkills, aiResult.weakEvidence,
            aiResult.keywordAnalysis, aiResult.formatting, JSON.stringify(aiResult.improvements), aiResult.hrReview,
            JSON.stringify(aiResult.interviewQuestions), aiResult.interviewPreparation, analysis.id
          ]
        );
        analysis = updateResult.rows[0];
      } else {
        const insertResult = await pool.query(
          `INSERT INTO analyses (
            user_id, resume_id, job_id, score, feedback, missing_skills, matching_skills, weak_evidence,
            keyword_analysis, formatting, improvements, hr_review, interview_questions, interview_preparation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *, id AS _id`,
          [
            req.user.id, resume.id, job.id, aiResult.score, aiResult.feedback, aiResult.missingSkills, aiResult.matchingSkills, aiResult.weakEvidence,
            aiResult.keywordAnalysis, aiResult.formatting, JSON.stringify(aiResult.improvements), aiResult.hrReview,
            JSON.stringify(aiResult.interviewQuestions), aiResult.interviewPreparation
          ]
        );
        analysis = insertResult.rows[0];
      }
    }

    // Fix casing for JSON output to match frontend expectations
    const formattedAnalysis = {
      ...analysis,
      score: Number(analysis.score),
      missingSkills: analysis.missing_skills,
      matchingSkills: analysis.matching_skills,
      weakEvidence: analysis.weak_evidence,
      keywordAnalysis: analysis.keyword_analysis,
      interviewQuestions: analysis.interview_questions,
      interviewPreparation: analysis.interview_preparation,
      hrReview: analysis.hr_review,
      resume: resumeId, // just id for simplicity, or we could return object
      job: jobId
    };

    // Persist analysis history
    await pool.query(
      'INSERT INTO analysis_histories (user_id, analysis_id, previous_score, new_score) VALUES ($1, $2, $3, $4)',
      [req.user.id, analysis.id, previousScore, analysis.score]
    );

    sendResponse(res, 201, { analysis: formattedAnalysis });
  } catch (err) {
    next(err);
  }
};

exports.getAllAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let queryParams = [req.user.id];
    let queryStr = 'WHERE a.user_id = $1';
    let paramIndex = 2;

    if (req.query.resumeId) {
      queryStr += ` AND a.resume_id = $${paramIndex}`;
      queryParams.push(req.query.resumeId);
      paramIndex++;
    }

    if (req.query.jobId) {
      queryStr += ` AND a.job_id = $${paramIndex}`;
      queryParams.push(req.query.jobId);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM analyses a ${queryStr}`, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    queryParams.push(limit, skip);
    const result = await pool.query(`
      SELECT a.*, a.id AS _id,
        json_build_object('_id', r.id, 'title', r.title) AS resume,
        json_build_object('_id', j.id, 'title', j.title) AS job
      FROM analyses a
      JOIN resumes r ON a.resume_id = r.id
      JOIN jobs j ON a.job_id = j.id
      ${queryStr}
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, queryParams);

    // Format output
    const analyses = result.rows.map(row => ({
      ...row,
      score: Number(row.score),
      missingSkills: row.missing_skills,
      matchingSkills: row.matching_skills,
      weakEvidence: row.weak_evidence,
      keywordAnalysis: row.keyword_analysis,
      interviewQuestions: row.interview_questions,
      interviewPreparation: row.interview_preparation,
      hrReview: row.hr_review
    }));

    res.status(200).json({
      status: 'success',
      results: analyses.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: {
        analyses
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnalysis = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.*, a.id AS _id,
        json_build_object('_id', r.id, 'title', r.title, 'extractedText', r.extracted_text) AS resume,
        json_build_object('_id', j.id, 'title', j.title, 'description', j.description) AS job
      FROM analyses a
      JOIN resumes r ON a.resume_id = r.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND a.user_id = $2
    `, [req.params.id, req.user.id]);

    const row = result.rows[0];

    if (!row) {
      return next(new AppError('No analysis found with that ID', 404));
    }

    const analysis = {
      ...row,
      score: Number(row.score),
      missingSkills: row.missing_skills,
      matchingSkills: row.matching_skills,
      weakEvidence: row.weak_evidence,
      keywordAnalysis: row.keyword_analysis,
      interviewQuestions: row.interview_questions,
      interviewPreparation: row.interview_preparation,
      hrReview: row.hr_review
    };

    sendResponse(res, 200, { analysis });
  } catch (err) {
    next(err);
  }
};