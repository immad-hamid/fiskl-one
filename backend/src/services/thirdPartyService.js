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

  static async validateInvoice(invoiceData) {
    const apiUrl = process.env.THIRD_PARTY_API_URL;
    const apiKey = process.env.THIRD_PARTY_API_KEY;
    console.log(apiUrl);
    console.log(apiKey);
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!apiUrl || !apiKey) {
      throw new Error('Third-party API configuration missing');
    }

    // Mock mode for development when external API is not available
    if (isDevelopment && process.env.MOCK_THIRD_PARTY_API === 'true') {
      console.log('🔧 Development mode: Mocking invoice validation...');
      
      // Simulate validation logic
      const payload = this.formatInvoicePayload(invoiceData);
      
      // Simulate some basic validation checks
      if (!payload.invoiceType || !payload.sellerBusinessName || !payload.buyerBusinessName) {
        throw new Error('Validation failed: Missing required fields');
      }
      
      if (!payload.items || payload.items.length === 0) {
        throw new Error('Validation failed: No items found in invoice');
      }
      
      // Simulate successful validation
      return {
        success: true,
        message: 'Invoice validation successful (mocked)',
        validationId: `mock_validation_${Date.now()}`
      };
    }

    try {
      const payload = this.formatInvoicePayload(invoiceData);
      console.log(payload);
      console.log(`${apiUrl}/fbr/validate-invoice`)
      const response = await axios.post(`${apiUrl}/fbr/validate-invoice`, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log(response);

      return this.validateResponse(response.data);
    } catch (error) {
      console.error('Invoice validation error:', error.message);
      
      // If we get a 404 in development, suggest using mock mode
      if (isDevelopment && error.response?.status === 404) {
        throw new Error('External API endpoint not found. Consider setting MOCK_THIRD_PARTY_API=true for development testing.');
      }
      
      throw error;
    }
  }

  static async postInvoice(invoiceData) {
    const apiUrl = process.env.THIRD_PARTY_API_URL;
    const apiKey = process.env.THIRD_PARTY_API_KEY;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!apiUrl || !apiKey) {
      throw new Error('Third-party API configuration missing');
    }

    // Mock mode for development when external API is not available
    if (isDevelopment && process.env.MOCK_THIRD_PARTY_API === 'true') {
      console.log('🔧 Development mode: Mocking invoice posting...');
      
      const payload = this.formatInvoicePayload(invoiceData);
      
      // Simulate posting logic
      if (!payload.invoiceType || !payload.sellerBusinessName || !payload.buyerBusinessName) {
        throw new Error('Posting failed: Missing required fields');
      }
      
      // Simulate successful posting
      return {
        success: true,
        message: 'Invoice posted successfully (mocked)',
        invoiceNumber: `FBR-${Date.now()}`,
        fbrReference: `mock_ref_${Date.now()}`
      };
    }

    try {
      const payload = this.formatInvoicePayload(invoiceData);
      
      const response = await axios.post(`${apiUrl}/fbr/post-invoice`, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return this.validateResponse(response.data);
    } catch (error) {
      console.error('Invoice posting error:', error.message);
      
      // If we get a 404 in development, suggest using mock mode
      if (isDevelopment && error.response?.status === 404) {
        throw new Error('External API endpoint not found. Consider setting MOCK_THIRD_PARTY_API=true for development testing.');
      }
      
      throw error;
    }
  }

  static formatInvoicePayload(invoiceData) {
    // Format date properly - handle both Date objects and strings
    let formattedDate;
    if (invoiceData.invoiceDate instanceof Date) {
      formattedDate = invoiceData.invoiceDate.toISOString().split('T')[0];
    } else if (typeof invoiceData.invoiceDate === 'string') {
      formattedDate = invoiceData.invoiceDate.split('T')[0];
    } else {
      formattedDate = new Date(invoiceData.invoiceDate).toISOString().split('T')[0];
    }

    return {
      invoiceType: invoiceData.invoiceType,
      invoiceDate: formattedDate, // Format as YYYY-MM-DD
      sellerNTNCNIC: invoiceData.sellerNTNCNIC,
      sellerBusinessName: invoiceData.sellerBusinessName,
      sellerProvince: invoiceData.sellerProvince,
      sellerAddress: invoiceData.sellerAddress,
      buyerNTNCNIC: invoiceData.buyerNTNCNIC,
      buyerBusinessName: invoiceData.buyerBusinessName,
      buyerProvince: invoiceData.buyerProvince,
      buyerAddress: invoiceData.buyerAddress,
      buyerRegistrationType: invoiceData.buyerRegistrationType,
      invoiceRefNo: invoiceData.invoiceRefNo || '',
      scenarioId: invoiceData.scenarioId,
      items: invoiceData.items.map(item => ({
        hsCode: item.hsCode,
        productDescription: item.productDescription,
        rate: item.rate,
        uoM: item.uoM,
        quantity: parseFloat(item.quantity),
        totalValues: parseFloat(item.totalValues),
        valueSalesExcludingST: parseFloat(item.valueSalesExcludingST),
        fixedNotifiedValueOrRetailPrice: parseFloat(item.fixedNotifiedValueOrRetailPrice),
        salesTaxApplicable: parseFloat(item.salesTaxApplicable),
        salesTaxWithheldAtSource: parseFloat(item.salesTaxWithheldAtSource),
        extraTax: item.extraTax || '',
        furtherTax: parseFloat(item.furtherTax),
        sroScheduleNo: item.sroScheduleNo || '',
        fedPayable: parseFloat(item.fedPayable),
        discount: parseFloat(item.discount),
        saleType: item.saleType,
        sroItemSerialNo: item.sroItemSerialNo || ''
      }))
    };
  }

  static validateResponse(responseData) {
    // Check main validation response
    if (!responseData.validationResponse || responseData.validationResponse.status !== 'Valid') {
      const error = responseData.validationResponse?.error || 'Unknown validation error';
      throw new Error(error);
    }

    // Check individual item statuses
    if (responseData.validationResponse.invoiceStatuses) {
      for (const status of responseData.validationResponse.invoiceStatuses) {
        if (status.status !== 'Valid') {
          const error = status.error || `Item ${status.itemSNo} validation failed`;
          throw new Error(error);
        }
      }
    }

    return responseData;
  }
}

module.exports = ThirdPartyService;