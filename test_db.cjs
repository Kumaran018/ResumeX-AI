const mongoose = require('mongoose');

async function checkData() {
  await mongoose.connect('mongodb://localhost:27017/resumex_ai');
  
  const Analysis = mongoose.connection.collection('analyses');
  const Resume = mongoose.connection.collection('resumes');
  const Job = mongoose.connection.collection('jobdescriptions');

  const analyses = await Analysis.find({}).toArray();
  const resumes = await Resume.find({}).toArray();
  const jobs = await Job.find({}).toArray();

  console.log("=== RESUMES ===");
  resumes.forEach(r => console.log(`ID: ${r._id}, Title: ${r.title}`));
  
  console.log("\n=== JOBS ===");
  jobs.forEach(j => console.log(`ID: ${j._id}, Title: ${j.title}`));

  console.log("\n=== ANALYSES ===");
  for (const a of analyses) {
    console.log(`ID: ${a._id}`);
    console.log(`  Resume: ${a.resume}`);
    console.log(`  Job: ${a.job}`);
    console.log(`  Score: ${a.score}`);
    console.log(`  Strong Skills: ${a.matchingSkills?.slice(0, 3)}`);
    console.log(`  Missing Skills: ${a.missingSkills?.slice(0, 3)}`);
  }

  process.exit(0);
}

checkData().catch(console.error);
