const InvoiceService = require('../services/invoiceService');
const ThirdPartyService = require('../services/thirdPartyService');

class InvoiceController {
  static async createInvoice(req, res, next) {
    try {
      const invoice = await InvoiceService.createInvoice(req.body);
      
      // Send to third-party API (don't wait for it to complete)
      ThirdPartyService.sendInvoiceData(invoice).catch(error => {
        console.error('Third-party API error:', error.message);
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoices(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = {
        status: req.query.status,
        invoiceType: req.query.invoiceType,
        sellerBusinessName: req.query.sellerBusinessName,
        buyerBusinessName: req.query.buyerBusinessName,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const result = await InvoiceService.getInvoices(page, limit, filters);

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);

      res.json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoice(req, res, next) {
    try {
      const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteInvoice(req, res, next) {
    try {
      await InvoiceService.deleteInvoice(req.params.id);

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoiceStatus(req, res, next) {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const invoice = await InvoiceService.updateInvoiceStatus(req.params.id, status);

      res.json({
        success: true,
        message: 'Invoice status updated successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadPDF(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      const PDFService = require('../services/pdfService');
      
      const pdfBuffer = await PDFService.generateInvoicePDF(invoice);
      
      const filename = invoice.invoiceNumber 
        ? `invoice-${invoice.invoiceNumber}.pdf` 
        : `invoice-${invoice.id}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceStats(req, res, next) {
    try {
      const stats = await InvoiceService.getInvoiceStats();

      res.json({
        success: true,
        message: 'Invoice statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvoiceController;