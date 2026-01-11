const mongoose = require('mongoose');
const evaluatorService = require('../services/evaluatorService');
const geminiService = require('../services/geminiService');
const Quiz = require('../models/Quiz');
const QuizAnswer = require('../models/QuizAnswer');

async function testServices() {
    console.log('--- Testing Services ---');

    // Test Evaluator (MCQ)
    console.log('Testing Evaluator (MCQ)...');
    const mcqResult = await evaluatorService.evaluate({
        type: 'mcq',
        studentAnswer: 1, // index
        correctAnswer: 1, // index
        marksAllocated: 5
    });
    console.log('MCQ Result:', mcqResult);

    // Test Evaluator (Structured - Fallback)
    console.log('\nTesting Evaluator (Structured - Fallback, no API key expected)...');
    const structuredResult = await evaluatorService.evaluate({
        type: 'structured',
        studentAnswer: 'The answer is 42',
        correctAnswer: '42',
        question: 'What is the answer?',
        solution: 'The answer is 42.'
    });
    console.log('Structured Result:', structuredResult);

    // Test Gemini Service Direct Call
    console.log('\nTesting Gemini Service (Mock/Real)...');
    try {
        const explanation = await geminiService.generateExplanation({
            question: 'What is 2+2?',
            studentAnswer: '4',
            correctAnswer: '4',
            solution: '2+2=4'
        });
        console.log('Explanation:', explanation);
    } catch (err) {
        console.log('Gemini Error (Expected if no key):', err.message);
    }
}

// Simple schema check (mocking mongoose models slightly if needed, but here just importing to check syntax)
async function checkSchemas() {
    console.log('\n--- Checking Schemas ---');
    try {
        const q = new Quiz({
            userId: new mongoose.Types.ObjectId(),
            type: 'adaptive',
            questions: []
        });
        console.log('Quiz Model instantiation successful.');
    } catch (err) {
        console.error('Quiz Model error:', err);
    }
}

(async () => {
    await testServices();
    await checkSchemas();
    process.exit(0);
})();
