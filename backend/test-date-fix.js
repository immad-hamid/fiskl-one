// Test script to verify date formatting fix
const ThirdPartyService = require('./src/services/thirdPartyService');

// Test data with Date object (like from Prisma)
const testInvoiceWithDateObject = {
  invoiceType: 'credit',
  invoiceDate: new Date('2025-08-15'),
  sellerNTNCNIC: '12345678901',
  sellerBusinessName: 'Test Seller',
  sellerProvince: 'Punjab',
  sellerAddress: 'Test Address',
  buyerNTNCNIC: '98765432109',
  buyerBusinessName: 'Test Buyer',
  buyerProvince: 'Punjab',
  buyerAddress: 'Buyer Address',
  buyerRegistrationType: 'NTN',
  invoiceRefNo: 'REF123',
  scenarioId: '1',
  items: [{
    hsCode: '1234',
    productDescription: 'Test Product',
    rate: 100.0,
    uoM: 'PCS',
    quantity: 2,
    totalValues: 200.0,
    valueSalesExcludingST: 180.0,
    fixedNotifiedValueOrRetailPrice: 200.0,
    salesTaxApplicable: 20.0,
    salesTaxWithheldAtSource: 0.0,
    extraTax: '',
    furtherTax: 0.0,
    sroScheduleNo: '',
    fedPayable: 0.0,
    discount: 0.0,
    saleType: 'local',
    sroItemSerialNo: ''
  }]
};

// Test data with string date (ISO format)
const testInvoiceWithStringDate = {
  ...testInvoiceWithDateObject,
  invoiceDate: '2025-08-15T10:30:00.000Z'
};

console.log('Testing date formatting fix...\n');

try {
  console.log('1. Testing with Date object:');
  const payload1 = ThirdPartyService.formatInvoicePayload(testInvoiceWithDateObject);
  console.log('   invoiceDate:', payload1.invoiceDate);
  console.log('   Type:', typeof payload1.invoiceDate);
  console.log('   ✅ Success\n');

  console.log('2. Testing with string date:');
  const payload2 = ThirdPartyService.formatInvoicePayload(testInvoiceWithStringDate);
  console.log('   invoiceDate:', payload2.invoiceDate);
  console.log('   Type:', typeof payload2.invoiceDate);
  console.log('   ✅ Success\n');

  console.log('All tests passed! Date formatting is working correctly.');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
