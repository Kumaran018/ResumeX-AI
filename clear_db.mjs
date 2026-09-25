import { MongoClient } from 'mongodb';
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('resumex_ai');
  await db.collection('analyses').deleteMany({});
  await db.collection('analysishistories').deleteMany({});
  console.log('Deleted all analyses');
  await client.close();
}
run().catch(console.error);
