const { prisma } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class InvoiceService {
  static async createInvoice(invoiceData) {
    const { items, ...allInvoiceDetails } = invoiceData;
    
    // Only pick fields that exist in the database schema for Invoice
    const allowedInvoiceFields = [
      'invoiceType', 'invoiceDate', 'sellerNTNCNIC', 'sellerBusinessName', 
      'sellerProvince', 'sellerAddress', 'buyerNTNCNIC', 'buyerBusinessName',
      'buyerProvince', 'buyerAddress', 'buyerRegistrationType', 'invoiceRefNo', 'scenarioId', 'status', 'fbrStatus'
    ];
    
    const invoiceDetails = {};
    allowedInvoiceFields.forEach(field => {
      if (allInvoiceDetails[field] !== undefined) {
        invoiceDetails[field] = allInvoiceDetails[field];
      }
    });
    
    // Only pick fields that exist in the database schema for InvoiceItem
    const allowedItemFields = [
      'hsCode', 'productDescription', 'rate', 'uoM', 'quantity', 'totalValues',
      'valueSalesExcludingST', 'fixedNotifiedValueOrRetailPrice', 'salesTaxApplicable',
      'salesTaxWithheldAtSource', 'extraTax', 'furtherTax', 'sroScheduleNo',
      'fedPayable', 'discount', 'saleType', 'sroItemSerialNo'
    ];
    
    const cleanedItems = items.map(item => {
      const cleanedItem = {};
      allowedItemFields.forEach(field => {
        if (item[field] !== undefined) {
          cleanedItem[field] = item[field];
        }
      });
      return cleanedItem;
    });
    
    // Calculate total amount
    const totalAmount = cleanedItems.reduce((sum, item) => sum + parseFloat(item.totalValues), 0);

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceDetails,
        totalAmount,
        items: {
          create: cleanedItems
        }
      },
      include: {
        items: true
      }
    });

    return invoice;
  }

  static async getInvoices(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    // Add filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.invoiceType) {
      where.invoiceType = filters.invoiceType;
    }
    if (filters.sellerBusinessName) {
      where.sellerBusinessName = {
        contains: filters.sellerBusinessName,
        mode: 'insensitive'
      };
    }
    if (filters.buyerBusinessName) {
      where.buyerBusinessName = {
        contains: filters.buyerBusinessName,
        mode: 'insensitive'
      };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.invoiceDate = {};
      if (filters.dateFrom) {
        where.invoiceDate.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.invoiceDate.lte = new Date(filters.dateTo);
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: true
        }
      }),
      prisma.invoice.count({ where })
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  static async getInvoiceById(id) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }

  static async updateInvoice(id, updateData) {
    const { items, ...allInvoiceDetails } = updateData;
    
    // Only pick fields that exist in the database schema for Invoice
    const allowedInvoiceFields = [
      'invoiceType', 'invoiceDate', 'sellerNTNCNIC', 'sellerBusinessName', 
      'sellerProvince', 'sellerAddress', 'buyerNTNCNIC', 'buyerBusinessName',
      'buyerProvince', 'buyerAddress', 'buyerRegistrationType', 'invoiceRefNo', 'scenarioId', 'status', 'fbrStatus'
    ];
    
    const invoiceDetails = {};
    allowedInvoiceFields.forEach(field => {
      if (allInvoiceDetails[field] !== undefined) {
        invoiceDetails[field] = allInvoiceDetails[field];
      }
    });
    
    // Calculate new total if items are provided
    let totalAmount;
    if (items) {
      // Only pick fields that exist in the database schema for InvoiceItem
      const allowedItemFields = [
        'hsCode', 'productDescription', 'rate', 'uoM', 'quantity', 'totalValues',
        'valueSalesExcludingST', 'fixedNotifiedValueOrRetailPrice', 'salesTaxApplicable',
        'salesTaxWithheldAtSource', 'extraTax', 'furtherTax', 'sroScheduleNo',
        'fedPayable', 'discount', 'saleType', 'sroItemSerialNo'
      ];
      
      const cleanedItems = items.map(item => {
        const cleanedItem = {};
        allowedItemFields.forEach(field => {
          if (item[field] !== undefined) {
            cleanedItem[field] = item[field];
          }
        });
        return cleanedItem;
      });
      
      totalAmount = cleanedItems.reduce((sum, item) => sum + parseFloat(item.totalValues), 0);
    }

    const updatePayload = {
      ...invoiceDetails,
      ...(totalAmount && { totalAmount })
    };

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: updatePayload,
      include: {
        items: true
      }
    });

    // Update items if provided
    if (items) {
      // Only pick fields that exist in the database schema for InvoiceItem
      const allowedItemFields = [
        'hsCode', 'productDescription', 'rate', 'uoM', 'quantity', 'totalValues',
        'valueSalesExcludingST', 'fixedNotifiedValueOrRetailPrice', 'salesTaxApplicable',
        'salesTaxWithheldAtSource', 'extraTax', 'furtherTax', 'sroScheduleNo',
        'fedPayable', 'discount', 'saleType', 'sroItemSerialNo'
      ];
      
      const cleanedItems = items.map(item => {
        const cleanedItem = {};
        allowedItemFields.forEach(field => {
          if (item[field] !== undefined) {
            cleanedItem[field] = item[field];
          }
        });
        return cleanedItem;
      });
      
      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: parseInt(id) }
      });

      await prisma.invoiceItem.createMany({
        data: cleanedItems.map(item => ({
          ...item,
          invoiceId: parseInt(id)
        }))
      });

      // Fetch updated invoice with new items
      return this.getInvoiceById(id);
    }

    return invoice;
  }

  static async deleteInvoice(id) {
    await prisma.invoice.delete({
      where: { id: parseInt(id) }
    });
  }

  static async updateInvoiceStatus(id, status) {
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: true
      }
    });

    return invoice;
  }

  static async updateInvoiceFbrStatus(id, fbrStatus) {
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { fbrStatus },
      include: {
        items: true
      }
    });

    return invoice;
  }

  static async getInvoiceStats() {
    const [
      totalInvoices,
      pendingInvoices,
      completedInvoices,
      totalAmount
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'pending' } }),
      prisma.invoice.count({ where: { status: 'completed' } }),
      prisma.invoice.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    return {
      totalInvoices,
      pendingInvoices,
      completedInvoices,
      totalAmount: totalAmount._sum.totalAmount || 0
    };
  }
}

module.exports = InvoiceService;