# ResumeX AI Backend

## Overview
This is the backend for ResumeX AI, providing APIs for authentication, resume PDF uploading/processing, job description creation, and candidate-job matching utilizing early-stage Mock AI capabilities.

## Setup Instructions

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (running locally on default port 27017 or a cloud URI)

### 2. Environment Variables
Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resumex_ai
JWT_SECRET=supersecretjwtkey_resume_x
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Installation
```bash
npm install
```

### 4. Running the application
```bash
npm run dev
```

## API Documentation & Postman
A `Postman_Collection.json` file is available in the root directory covering all implemented paths. Import it to Postman via File -> Import.

### Key API Notes
- **Authentication**: JWT is returned upon Signup/Login. Passwords are encrypted utilizing bcrypt. Include the token as `Bearer <token>` in the Authorization header.
- **Logout Strategy**: Client clears token. Backend sends a 200 JSON success block to confirm the action.
- **Resume Uploading**: `POST /api/resumes` requires `Content-Type: multipart/form-data`, passing a valid PDF file in the `resume` field. Maximum size is 10MB. 
- **Pagination**: `GET /api/analyses` supports queries `?page=1&limit=10`.
- **Deletion Strategy**: Calling `DELETE /api/resumes/:id` strictly unlinks the PDF off the disk, deletes any tied `Analysis` documents, and clears `AnalysisHistory` documents to maintain structural database integrity. 

## Mock AI Analysis Mechanism
- **POST /api/analyze** creates or updates the current candidate analysis between a provided resume and job description ID natively owned by the current user. 
- If analyzed before, the AI service mock simulates newly generated analysis scores (60-100 range) reflecting updated AI insights, and stores the interaction context explicitly within the independent `AnalysisHistory` collection tracking all changes made. This retains full historical persistence over multiple assessments. All matching/missing skills are demonstrative mocks highlighting NodeJS, React Native, SQL, AWS contexts.

*Note: Replace `aiService.js` in `./src/services` with functional GenAI prompt integrations (e.g. Gemini, OpenAI) utilizing the provided interface structure to unlock authentic logic later.*
