import { MongoClient, ObjectId } from 'mongodb';

async function testApi() {
  console.log("Starting test...");
  
  // Register a new user
  const regRes = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: `test_${Date.now()}@example.com`, password: 'password', passwordConfirm: 'password' })
  });
  const regData = await regRes.json();
  const token = regData.token;
  const userId = regData.data.user._id;

  console.log("Connecting to MongoDB...");
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('resumex_ai');
  
  const userObjectId = new ObjectId(userId);
  
  // Insert a dummy Job that needs Python and Django
  console.log("Inserting Job...");
  const jobResult = await db.collection('jobdescriptions').insertOne({
    title: "Python Developer",
    description: "Looking for an expert in Python, Django, and PostgreSQL.",
    requirements: "Python, Django, PostgreSQL",
    user: userObjectId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const jobId = jobResult.insertedId;

  // Insert a dummy Resume that has Python and Django, but NO JavaScript/Node.js/Express
  console.log("Inserting Resume...");
  const resumeResult = await db.collection('resumes').insertOne({
    title: "Python Dev Resume",
    extractedText: "Experienced software engineer with 5 years of Python development. Built web apps using Django and PostgreSQL. Certified in nothing. Skills: Python, Django, PostgreSQL.",
    filePath: "dummy.pdf",
    user: userObjectId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const resumeId = resumeResult.insertedId;

  console.log(`Created Job ${jobId} and Resume ${resumeId}`);

  // Test the analyze endpoint
  console.log("Calling /api/analyze...");
  const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ resumeId: resumeId.toString(), jobId: jobId.toString() })
  });
  
  const analyzeData = await analyzeRes.json();
  console.log("STATUS CODE:", analyzeRes.status);
  if (!analyzeRes.ok) {
    console.error("ERROR:", analyzeData);
  } else {
    console.log("SCORE:", analyzeData.data.analysis.score);
    console.log("MATCHING SKILLS:", analyzeData.data.analysis.matchingSkills);
    console.log("MISSING SKILLS:", analyzeData.data.analysis.missingSkills);
    console.log("WEAK EVIDENCE:", analyzeData.data.analysis.weakEvidence);
  }

  await client.close();
}

testApi().catch(console.error);
