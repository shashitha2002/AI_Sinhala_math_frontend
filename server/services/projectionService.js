const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Projection Service - Communicates with Python projection system
 */
class ProjectionService {
  constructor() {
    this.dktServiceURL = process.env.DKT_SERVICE_URL || 'http://localhost:5002';
    this.mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.projectionDir = path.join(__dirname, '../../ml-services');
  }

  /**
   * Run projection simulation
   * @param {Object} params - Simulation parameters
   * @returns {Promise<Object>} Simulation results
   */
  async runProjection(params = {}) {
    try {
      const {
        numStudents = 100,
        numSessions = 50,
        targetTopic = 'G11_16',
        targetMastery = 0.85
      } = params;

      // Run Python simulation script
      return new Promise((resolve, reject) => {
        const scriptPath = path.join(this.projectionDir, 'run_projection.py');
        const pythonProcess = spawn(this.pythonPath, [scriptPath], {
          cwd: this.projectionDir,
          env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
          console.log(`[Projection] ${data.toString()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error(`[Projection Error] ${data.toString()}`);
        });

        pythonProcess.on('close', async (code) => {
          if (code === 0) {
            try {
              // Read generated report
              const reportPath = path.join(this.projectionDir, 'simulation_report.json');
              const reportData = await fs.readFile(reportPath, 'utf8');
              const report = JSON.parse(reportData);

              resolve({
                success: true,
                report,
                message: 'Projection completed successfully'
              });
            } catch (error) {
              reject(new Error(`Failed to read projection report: ${error.message}`));
            }
          } else {
            reject(new Error(`Projection failed with code ${code}: ${stderr}`));
          }
        });

        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to start projection: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('Projection service error:', error);
      throw error;
    }
  }

  /**
   * Get projection report if available
   * @returns {Promise<Object>} Projection report
   */
  async getProjectionReport() {
    try {
      const reportPath = path.join(this.projectionDir, 'simulation_report.json');
      const reportData = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportData);

      return {
        success: true,
        report
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          message: 'No projection report available. Run projection first.'
        };
      }
      throw error;
    }
  }

  /**
   * Get XAI explanation for recommendation
   * @param {Object} recommendation - Recommendation data
   * @param {Object} student - Student data
   * @param {Array} knowledgeVector - Knowledge state vector
   * @returns {Promise<Object>} XAI explanation
   */
  async getXAIExplanation(recommendation, student, knowledgeVector) {
    try {
      const response = await axios.post(
        `${this.dktServiceURL}/explain_recommendation`,
        {
          student: {
            student_id: student._id?.toString() || student.studentId,
            anxiety_level: student.stressIndicators?.stressLevel / 100 || 0.5,
            history: student.history || []
          },
          question: {
            question_id: recommendation.optimal_question_id,
            topic_id: recommendation.optimal_topic_id,
            topic_name: recommendation.recommended_topic,
            difficulty: recommendation.difficulty || 1.0
          },
          knowledge_vector: knowledgeVector,
          predicted_success_rate: recommendation.predicted_success_rate || 0.5
        },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        success: true,
        explanation: response.data.explanation,
        xai_data: response.data.xai_data,
        key_factors: response.data.key_factors,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('XAI explanation error:', error.message);
      // Return fallback explanation
      return {
        success: false,
        explanation: this.generateFallbackExplanation(recommendation),
        key_factors: ['Adaptive Learning Recommendation'],
        confidence: recommendation.predicted_success_rate || 0.5
      };
    }
  }

  /**
   * Generate fallback explanation if XAI service unavailable
   */
  generateFallbackExplanation(recommendation) {
    const topic = recommendation.recommended_topic || 'this topic';
    const successRate = (recommendation.predicted_success_rate || 0.5) * 100;

    return `🎯 Adaptive Goal: Mastery in ${topic}
Recommended Action: Focus on this question (Predicted Success: ${successRate.toFixed(0)}%)

✅ Why This Recommendation?
• Personalized Learning: This question is selected based on your current knowledge state and learning trajectory.
• Optimal Challenge: The difficulty level is calibrated to maximize your learning gain.
• Progress Tracking: Our system continuously adapts to your performance to ensure efficient learning.

📚 The Path Forward:
This recommendation aligns with your learning goals and current progress. Continue practicing to build mastery.`;
  }

  /**
   * Check if projection visualizations are available
   * @returns {Promise<Object>} Available visualizations
   */
  async getVisualizations() {
    try {
      const vizFiles = [
        'learning_curves.png',
        'kpi_comparison.png',
        'improvement_metrics.png'
      ];

      const available = {};
      for (const file of vizFiles) {
        const filePath = path.join(this.projectionDir, file);
        try {
          await fs.access(filePath);
          available[file] = `/api/projections/visualization/${file}`;
        } catch {
          available[file] = null;
        }
      }

      return {
        success: true,
        visualizations: available
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ProjectionService();

