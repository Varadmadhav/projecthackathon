import axios from 'axios';

// ML Service configuration
const ML_API_URL = 'http://127.0.0.1:8000'; // FastAPI server URL

/**
 * Service for interacting with the ML model
 */
const mlService = {
  /**
   * Get prediction from ML model
   * @returns {Promise<Object>} Prediction data including sensor data and carbon coefficients
   */
  getPrediction: async () => {
    try {
      const response = await axios.get(`${ML_API_URL}/predict`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction from ML model:', error);
      throw error;
    }
  },

  /**
   * Get total carbon credits
   * @returns {Promise<Object>} Total carbon credits and timestamp
   */
  getTotalCredits: async () => {
    try {
      const response = await axios.get(`${ML_API_URL}/total`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total credits from ML model:', error);
      throw error;
    }
  }
};

export default mlService;