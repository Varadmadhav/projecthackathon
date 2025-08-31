import axios from 'axios';

// Backend API configuration
const API_URL = 'http://localhost:5000/api'; // Express backend server URL

/**
 * Service for interacting with the blockchain through the backend
 */
const blockchainService = {
  /**
   * Get user's carbon credits from blockchain
   * @param {string} userId - The farmer's ID
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} User's carbon credits
   */
  getUserCredits: async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/credits/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  },

  /**
   * Sell carbon credits on the blockchain
   * @param {string} userId - The farmer's ID
   * @param {number} amount - Amount of credits to sell
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Transaction result
   */
  sellCredits: async (userId, amount, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/credits/sell/${userId}`,
        { amount },
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      console.error('Error selling credits:', error);
      throw error;
    }
  }
};

export default blockchainService;