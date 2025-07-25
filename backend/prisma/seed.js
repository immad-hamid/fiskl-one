const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample user
  const user = await prisma.user.upsert({
    where: { apiKey: 'demo-api-key-123' },
    update: {},
    create: {
      apiKey: 'demo-api-key-123',
      companyName: 'Demo Company Ltd.',
      companyAddress: '123 Demo Street, Demo City, Demo Province',
      companyPhone: '+92-300-1234567'
    }
  });

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-DEMO-001',
      invoiceType: 'Sale Invoice',
      invoiceDate: new Date('2024-01-15'),
      sellerNTNCNIC: '1234567890123',
      sellerBusinessName: 'Demo Seller Business',
      sellerProvince: 'Punjab',
      sellerAddress: '456 Seller Street, Lahore, Punjab',
      buyerNTNCNIC: '9876543210987',
      buyerBusinessName: 'Demo Buyer Business',
      buyerProvince: 'Sindh',
      buyerAddress: '789 Buyer Avenue, Karachi, Sindh',
      buyerRegistrationType: 'Registered',
      invoiceRefNo: 'REF-001',
      scenarioId: 'SN001',
      totalAmount: 11800.00,
      status: 'completed',
      items: {
        create: [
          {
            hsCode: '1234.5678',
            productDescription: 'Sample Product 1',
            rate: '17%',
            uoM: 'PCS',
            quantity: 10,
            totalValues: 11800.00,
            valueSalesExcludingST: 10000.00,
            fixedNotifiedValueOrRetailPrice: 10000.00,
            salesTaxApplicable: 1700.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: '',
            furtherTax: 100.00,
            sroScheduleNo: '',
            fedPayable: 0.00,
            discount: 0.00,
            saleType: 'Regular',
            sroItemSerialNo: ''
          },
          {
            hsCode: '8765.4321',
            productDescription: 'Sample Product 2',
            rate: '17%',
            uoM: 'KG',
            quantity: 5,
            totalValues: 5900.00,
            valueSalesExcludingST: 5000.00,
            fixedNotifiedValueOrRetailPrice: 5000.00,
            salesTaxApplicable: 850.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: '',
            furtherTax: 50.00,
            sroScheduleNo: '',
            fedPayable: 0.00,
            discount: 0.00,
            saleType: 'Regular',
            sroItemSerialNo: ''
          }
        ]
      }
    },
    include: {
      items: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - User: ${user.companyName}`);
  console.log(`   - Invoice: ${invoice.invoiceNumber} with ${invoice.items.length} items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });