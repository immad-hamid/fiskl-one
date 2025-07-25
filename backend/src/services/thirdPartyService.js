const axios = require('axios');

class ThirdPartyService {
  static async sendInvoiceData(invoiceData) {
    const apiUrl = process.env.THIRD_PARTY_API_URL;
    const apiKey = process.env.THIRD_PARTY_API_KEY;

    if (!apiUrl || !apiKey) {
      console.warn('Third-party API configuration missing');
      return;
    }

    try {
      const response = await axios.post(apiUrl, {
        invoice: invoiceData,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('Third-party API response:', response.status);
      return response.data;
    } catch (error) {
      console.error('Third-party API error:', error.message);
      throw error;
    }
  }
}

module.exports = ThirdPartyService;