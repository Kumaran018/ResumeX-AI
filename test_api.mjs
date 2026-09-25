import fs from 'fs';

async function testApi() {
  console.log("Starting test...");
  // Login to get token
  let token = null;
  const regRes = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: `test_${Date.now()}@example.com`, password: 'password', passwordConfirm: 'password' })
  });
  const regData = await regRes.json();
  token = regData.token;
  
  if (!token) {
    console.error("Failed to register", regData);
    return;
  }

  // Create Job
  const jobRes = await fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Senior Developer',
      description: 'We need someone with React Native, GraphQL, and AWS experience.',
      requirements: 'Experience with React Native, GraphQL, and AWS'
    })
  });
  const jobData = await jobRes.json();
  const jobId = jobData.data?.job?._id;

  // Create Resume (Wait, resume upload requires a PDF file via multipart/form-data)
  // I will just create a tiny text file and upload it as a pdf?
  // Let's create a fake PDF with text "I know JavaScript, Node.js, and Express." using pdf-lib?
  // Actually, I can just create the Resume document directly using a quick script...
  // Since I can't upload a real PDF easily without a library, let me write a quick CommonJS script to insert into MongoDB directly to bypass the PDF upload!
}

testApi().catch(console.error);
