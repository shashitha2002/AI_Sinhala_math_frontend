// export-dkt-data.js  (save this in C:\Users\...\reserch\server\   ← project root)
require('dotenv').config();  // loads .env from root

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Correct absolute paths – works no matter where you run from
const User = require('../models/User'); 
const PerformanceData = require('../models/PerformanceData');
const Question = require('../models/Question');

async function exportDKTData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://IreshDB:IreshDB@cluster01.s0ull8e.mongodb.net/ol_math_platform');
    console.log('Connected to MongoDB');

    // Fetch all synthetic students
    const students = await User.find({ 
      role: 'student', 
      email: /@synthetic\.com$/ 
    }).select('_id');

    console.log(`Found ${students.length} synthetic students`);

    // Map question ObjectId → questionId (Q000001) and topicId
    const questions = await Question.find({}).select('_id questionId topicId');
    const questionMap = {};
    questions.forEach(q => {
      const qNum = parseInt(q.questionId.replace('Q', '')) || 0;
      questionMap[q._id.toString()] = {
        question_id: qNum,
        topic_id: q.topicId  // e.g., "G10_01"
      };
    });

    // Map topicId string → number (for DKT model)
    const topicToIndex = {};
    let index = 0;
    for (const q of questions) {
      if (!(q.topicId in topicToIndex)) {
        topicToIndex[q.topicId] = index++;
      }
    }

    const trainingData = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const records = await PerformanceData.find({ studentId: student._id })
        .sort({ timestamp: 1 })
        .limit(500);  // prevent huge files

      if (records.length < 5) continue;

      const interactions = records.map(r => {
        const q = questionMap[r.questionId?.toString()];
        if (!q) return null;
        return {
          question_id: q.question_id,
          topic_id: topicToIndex[q.topic_id],  // numeric index
          is_correct: r.isCorrect ? 1 : 0,
          time_taken: r.timeTaken,
          attempts: r.attemptsCount || 1
        };
      }).filter(Boolean);

      if (interactions.length >= 5) {
        trainingData.push({
          student_id: student._id.toString(),
          interactions: interactions
        });
      }

      if (i % 500 === 0) console.log(`Processed ${i}/${students.length} students...`);
    }

    // Save file in the same folder
    const outputPath = path.join(__dirname, 'dkt_training_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(trainingData, null, 2));
    
    console.log(`\nSUCCESS! Exported ${trainingData.length} students`);
    console.log(`File saved: ${outputPath}`);
    console.log(`Total interactions: ${trainingData.reduce((s, x) => s + x.interactions.length, 0)}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportDKTData();