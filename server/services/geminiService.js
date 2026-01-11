const axios = require('axios');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GENAI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        if (!this.apiKey || this.apiKey === 'dummy') {
            console.warn('⚠️ GENAI_API_KEY is missing or set to "dummy". AI features will return mock responses.');
            this.apiKey = 'dummy'; // fallback to explicit dummy string if missing
        } else {
            console.log('✅ Gemini Service initialized with API Key');
        }
    }

    /**
     * Generate content using Gemini
     * @param {string} prompt - The prompt to send to Gemini
     * @returns {Promise<string>} - The generated text
     */
    async generateContent(prompt) {
        if (this.apiKey === 'dummy') {
            console.warn('Using Mock Gemini Response (Key is dummy)');
            return 'This is a mock response from Gemini Service because the API key is missing. Please set GENAI_API_KEY in server/.env';
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error calling Gemini API:', error.response?.data || error.message);
            throw new Error('Failed to generate content from Gemini AI.');
        }
    }

    /**
     * Generate an explanation for a math problem
     * @param {object} params
     * @param {string} params.question
     * @param {string} params.studentAnswer
     * @param {string} params.correctAnswer
     * @param {string} params.solution
     * @returns {Promise<string>}
     */
    async generateExplanation({ question, studentAnswer, correctAnswer, solution }) {
        const prompt = `
      You are a helpful math tutor.
      Question: ${question}
      Correct Answer: ${correctAnswer}
      Detailed Solution: ${solution}
      Student Answer: ${studentAnswer}

      Please provide a helpful explanation for the student. 
      If the answer is correct, congratulate them and briefly reinforce the key concept.
      If incorrect, kindly explain where they might have gone wrong and walk through the correct approach using the solution provided.
      Keep it concise and encouraging.
    `;
        return this.generateContent(prompt);
    }

    /**
     * Evaluate a structured answer
     * @param {string} question
     * @param {string} studentAnswer
     * @param {string} solution
     * @returns {Promise<object>} { isCorrect: boolean, feedback: string, marksPercentage: number }
     */
    async evaluateAnswer({ question, studentAnswer, solution, realAnswer }) {
        // Mock response if API key is missing or dummy
        if (!this.apiKey || this.apiKey === 'dummy') {
            console.log('⚠️ Using Mock Gemini Response (API Key missing or dummy)');
            return {
                "isCorrect": true,
                "marksPercentage": 85,
                "feedback": "Correct (Mock)",
                "explanation": "This is a **mock explanation** because the `GENAI_API_KEY` is not set or is 'dummy'. \n\nIn a real scenario, the AI would analyze your steps: \n1. Step 1 checked \n2. Final answer verified. \n\nGood job!"
            };
        }

        const prompt = `
      You are a strict but fair math grader.
      Question: ${question}
      Reference Solution (Steps): ${solution}
      Target Final Answer: ${realAnswer}
      Student Answer: ${studentAnswer}

      Evaluate the student's answer. 
      1. Check if the Student Answer matches the Target Final Answer (allowing for minor formatting differences).
      2. If the student provided steps, check if they align with the Reference Solution logic.
      3. If the answer is correct but steps are missing, give full credit unless specified otherwise.
      
      Return ONLY a JSON object with the following format:
      {
        "isCorrect": boolean, // true if the final answer is correct
        "marksPercentage": number, // 0 to 100
        "feedback": "string", // Short status e.g. "Correct", "Incorrect", "Partially Correct"
        "explanation": "string" // A helpful explanation of WHY it is right or wrong, referencing the solution steps. Be encouraging but clear.
      }
    `;

        try {
            const rawText = await this.generateContent(prompt);
            // Clean up markdown code blocks if present
            const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error('Error parse Gemini evaluation:', error);
            // Fallback
            return {
                isCorrect: false,
                marksPercentage: 0,
                feedback: "Error evaluating answer. Please verify manually."
            };
        }
    }
}

module.exports = new GeminiService();
