const express = require('express');
const router = express.Router();
const evaluatorService = require('../services/evaluatorService');
const { protect } = require('../middleware/auth');

// @route   POST /api/evaluate/explain
// @desc    Evaluate a single answer and provide AI explanation
// @access  Private
router.post('/explain', protect, async (req, res) => {
    try {
        const {
            question,
            userAnswer,
            solution,
            correctAnswer,
            type = 'generated'
        } = req.body;

        if (!question || !userAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Question and User Answer are required'
            });
        }

        const evaluation = await evaluatorService.evaluate({
            type,
            studentAnswer: userAnswer,
            correctAnswer,
            question,
            solution
        });

        res.json({
            success: true,
            evaluation
        });

    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating answer'
        });
    }
});

// @route   POST /api/evaluate/quiz
// @desc    Evaluate a full quiz
// @access  Private
router.post('/quiz', protect, async (req, res) => {
    try {
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Questions array is required'
            });
        }

        console.log(`Evaluating batch of ${questions.length} questions...`);

        const results = await Promise.all(questions.map(async (q) => {
            try {
                return await evaluatorService.evaluate({
                    type: 'generated',
                    studentAnswer: q.userFinalAnswer || q.userStepAnswers?.join(' ') || "No answer provided",
                    correctAnswer: q.correctAnswer,
                    question: q.question,
                    solution: q.solution,
                    // Pass step answers if available for more detailed context
                    // steps: q.steps 
                });
            } catch (err) {
                console.error('Error evaluating individual question:', err);
                return {
                    isCorrect: false,
                    marksObtained: 0,
                    feedback: "Evaluation failed for this question."
                };
            }
        }));

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Batch evaluation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating quiz'
        });
    }
});

module.exports = router;
