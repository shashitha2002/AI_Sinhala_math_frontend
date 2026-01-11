const geminiService = require('./geminiService');

class EvaluatorService {
    /**
     * Evaluate a student's answer
     * @param {object} params
     * @param {string} params.type - 'mcq' | 'structured'
     * @param {string} params.studentAnswer - The student's input (or index for mcq)
     * @param {string|number} params.correctAnswer - The correct answer
     * @param {string} params.question - The question text (for AI context)
     * @param {string} params.solution - The detailed solution (for AI context)
     * @returns {Promise<object>} { isCorrect, marksObtained, feedback }
     */
    async evaluate(params) {
        const { type, studentAnswer, correctAnswer, question, solution, marksAllocated = 100, stepIndex, steps } = params;

        // If evaluating a specific step
        if (typeof stepIndex !== 'undefined' && steps && steps[stepIndex]) {
            const step = steps[stepIndex];
            const stepCorrectAnswer = step.correctAnswer;

            // Use Gemini or fallback for step evaluation
            // We reuse evaluateAnswer but context is focused on this step
            try {
                const aiResult = await geminiService.evaluateAnswer({
                    question: `${question} (Step ${stepIndex + 1}: ${step.instruction})`,
                    studentAnswer: studentAnswer,
                    solution: step.explanation || solution, // Use step explanation as micro-solution if available
                    realAnswer: stepCorrectAnswer
                });

                return {
                    isCorrect: aiResult.isCorrect,
                    marksObtained: aiResult.isCorrect ? (marksAllocated / steps.length) : 0, // rough partial logic
                    feedback: aiResult.feedback
                };
            } catch (err) {
                // Fallback simple match for step
                const normalizedStudent = String(studentAnswer).toLowerCase().replace(/\s+/g, '');
                const normalizedCorrect = String(stepCorrectAnswer).toLowerCase().replace(/\s+/g, '');
                const isCorrect = normalizedStudent === normalizedCorrect;
                return {
                    isCorrect,
                    marksObtained: isCorrect ? (marksAllocated / steps.length) : 0,
                    feedback: isCorrect ? 'Correct step' : 'Incorrect step'
                };
            }
        }

        if (type === 'mcq') {
            // numeric index comparison
            const isCorrect = parseInt(studentAnswer) === parseInt(correctAnswer);
            return {
                isCorrect,
                marksObtained: isCorrect ? marksAllocated : 0,
                feedback: isCorrect ? 'Correct!' : 'Incorrect.'
            };
        } else if (type === 'structured' || type === 'generated') {
            // Use Gemini for intelligent evaluation
            try {
                const aiResult = await geminiService.evaluateAnswer({
                    question,
                    studentAnswer: studentAnswer,
                    solution,
                    realAnswer: correctAnswer // Passing correct answer as real answer
                });

                // Calculate marks based on percentage
                const marksObtained = Math.round((aiResult.marksPercentage / 100) * marksAllocated);

                return {
                    isCorrect: aiResult.isCorrect,
                    marksObtained,
                    feedback: aiResult.feedback,
                    explanation: aiResult.explanation
                };
            } catch (err) {
                console.error("AI Evaluation failed, falling back to basic match", err);
                // Fallback: Exact string match (ignoring whitespace/case)
                const normalizedStudent = String(studentAnswer).toLowerCase().replace(/\s+/g, '');
                // correct answer might be in 'solution' or 'correctAnswer' (which might be text now)
                // Assuming 'correctAnswer' holds the final answer text for structured qs if available, or extracting from solution
                // For now, let's assume we pass the expected answer text in 'correctAnswer' if simple match is desired.

                const normalizedCorrect = String(correctAnswer).toLowerCase().replace(/\s+/g, '');
                const isCorrect = normalizedStudent === normalizedCorrect;

                return {
                    isCorrect,
                    marksObtained: isCorrect ? marksAllocated : 0,
                    feedback: isCorrect ? 'Correct' : 'Incorrect (Fallback check)'
                };
            }
        }

        return { isCorrect: false, marksObtained: 0, feedback: 'Unknown question type' };
    }
}

module.exports = new EvaluatorService();
