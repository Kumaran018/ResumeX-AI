import { MongoClient } from 'mongodb';

async function checkDb() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('resumex_ai');
  
  const resumes = await db.collection('resumes').find({}).toArray();
  console.log(`Found ${resumes.length} resumes`);
  
  for (const r of resumes) {
    console.log(`--- RESUME: ${r.title} (${r._id}) ---`);
    console.log(`TEXT LENGTH: ${r.extractedText?.length}`);
    console.log(`PREVIEW: ${r.extractedText?.substring(0, 100).replace(/\n/g, ' ')}...`);
  }

  const analyses = await db.collection('analyses').find({}).toArray();
  const jobs = await db.collection('jobdescriptions').find({}).toArray();

  for (const a of analyses) {
    const r = resumes.find(r => r._id.toString() === a.resume.toString());
    const j = jobs.find(j => j._id.toString() === a.job.toString());
    console.log("=== JOB ===");
    console.log(j ? j.description.substring(0, 100) : "N/A");
    console.log("=== ANALYSIS ===");
    console.log(JSON.stringify(a.matchingSkills));
    console.log(JSON.stringify(a.missingSkills));
    console.log(a.feedback ? a.feedback.substring(0, 50) : "No feedback");
    console.log("-------------------");
  }

  await client.close();
}

checkDb().catch(console.error);
