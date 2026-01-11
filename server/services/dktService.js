const axios = require('axios');

/**
 * DKT Service - Communicates with Python DKT model service
 */
class DKTService {
  constructor() {
    this.baseURL = process.env.DKT_SERVICE_URL || 'http://localhost:5002';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Call DKT service endpoint
   */
  async call(endpoint, data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${endpoint}`,
        data,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      const errorDetails = error.response?.status 
        ? `Status ${error.response.status}: ${errorMessage}`
        : errorMessage;
      
      console.error(`DKT Service Error (${endpoint}):`, errorDetails);
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error(`  → DKT service at ${this.baseURL} is not responding. Is it running?`);
      }
      throw new Error(`DKT service unavailable: ${errorDetails}`);
    }
  }

  /**
   * Predict knowledge state from student history
   * @param {Array} studentHistory - Array of interaction objects
   * @returns {Promise<Object>} Knowledge vector and mastery scores
   */
  async predictKnowledgeState(studentHistory) {
    try {
      const result = await this.call('predict_knowledge_state', {
        student_history: studentHistory
      });
      return result;
    } catch (error) {
      console.error('Error predicting knowledge state:', error);
      // Return fallback (uniform mastery)
      return {
        success: false,
        knowledge_vector: new Array(100).fill(0.5),
        mastery_scores: {}
      };
    }
  }

  /**
   * Recommend next optimal action
   * @param {Array} knowledgeVector - Current knowledge state vector
   * @param {Array} unattemptedQuestions - List of unattempted questions
   * @returns {Promise<Object>} Recommendation with optimal question and success rate
   */
  async recommendNextAction(knowledgeVector, unattemptedQuestions) {
    try {
      const result = await this.call('recommend_next_action', {
        knowledge_vector: knowledgeVector,
        unattempted_questions: unattemptedQuestions
      });
      return result;
    } catch (error) {
      console.error('Error getting recommendation:', error);
      // Return fallback recommendation
      if (unattemptedQuestions.length > 0) {
        return {
          success: false,
          optimal_question_id: unattemptedQuestions[0].question_id,
          recommended_topic: unattemptedQuestions[0].topic_name,
          predicted_success_rate: 0.5
        };
      }
      return {
        success: false,
        optimal_question_id: null,
        recommended_topic: null,
        predicted_success_rate: 0.0
      };
    }
  }

  /**
   * Check if DKT service is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return {
        status: 'ERROR',
        model_loaded: false,
        error: error.message
      };
    }
  }
}

module.exports = new DKTService();


