const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { AppError } = require('../utils/errors');

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    // Validate PDF magic bytes (%PDF)
    if (dataBuffer.length < 4 || dataBuffer.toString('utf8', 0, 4) !== '%PDF') {
      throw new Error('Invalid PDF format signature');
    }

    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    
    if (!data || !data.text || !data.text.trim()) {
      throw new AppError('No readable text found in PDF. Scanned images are not supported.', 400);
    }
    
    return data.text;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PDF Parse Error:', err);
    }
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Failed to extract text from PDF file. Ensure it is a valid PDF.', 400);
  }
};

module.exports = { extractTextFromPDF };
