// Script to seed initial student data
// Run with: node scripts/seed-students.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting';

const students = [
  { studentId: 'STUDENT001', name: 'John Doe' },
  { studentId: 'STUDENT002', name: 'Jane Smith' },
  { studentId: 'STUDENT003', name: 'Mike Johnson' },
  { studentId: 'STUDENT004', name: 'Sarah Williams' },
  { studentId: 'STUDENT005', name: 'Tom Brown' },
  { studentId: 'STUDENT006', name: 'Emma Davis' },
  { studentId: 'STUDENT007', name: 'David Martinez' },
  { studentId: 'STUDENT008', name: 'Olivia Garcia' }
];

async function seedStudents() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db('evoting');
    const collection = db.collection('students');
    
    // Clear existing students
    await collection.deleteMany({});
    
    // Insert new students
    const result = await collection.insertMany(students);
    console.log(`✅ ${result.insertedCount} students seeded`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedStudents();
