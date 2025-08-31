import mlService from './mlService';
import blockchainService from './blockchainService';

/**
 * Integration service to connect ML model with blockchain
 */
const integrationService = {
  /**
   * Get carbon credit dashboard data
   * @param {string} userId - The farmer's ID
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: async (userId, token) => {
    try {
      // For demo purposes, we'll use a mock userId and token if not provided
      const mockUserId = userId || '60d0fe4f5311236168a109ca';
      const mockToken = token || 'mocktoken123';
      
      // Get data from ML model
      const mlPrediction = await mlService.getPrediction();
      const totalCredits = await mlService.getTotalCredits();
      
      // Get data from blockchain via backend
      let userCredits = { credits: 0 };
      try {
        userCredits = await blockchainService.getUserCredits(mockUserId, mockToken);
      } catch (err) {
        console.log('Using mock blockchain data due to connection error');
      }
      
      return {
        currentPrediction: mlPrediction?.pred_coef_tCha_year || 0,
        annualRate: mlPrediction?.annual_rate_tCO2e || 0,
        totalCredits: totalCredits?.total_credits_tCO2e || 0,
        userCredits: userCredits?.credits || 0,
        sensorData: mlPrediction?.sensor_data || {}
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      // Return mock data for demonstration
      return {
        currentPrediction: 0.571,
        annualRate: 4.19,
        totalCredits: 2.5,
        userCredits: 1.2,
        sensorData: {
          soil_moist: 65.3,
          temp: 28.4,
          humidity: 72.1,
          light: 850,
          soil_temp: 24.2
        }
      };
    }
  }
};

export default integrationService;