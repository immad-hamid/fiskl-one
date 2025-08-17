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
      // First, get the current invoice to check its status
      const currentInvoice = await InvoiceService.getInvoiceById(req.params.id);
      
      // Check if invoice is completed and posted to FBR
      if (currentInvoice.status === 'completed' && currentInvoice.fbrStatus === 'posted') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update invoice: Invoice has been posted to FBR and is locked for editing'
        });
      }

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
      // First, get the current invoice to check its status
      const currentInvoice = await InvoiceService.getInvoiceById(req.params.id);
      
      // Check if invoice is completed and posted to FBR
      if (currentInvoice.status === 'completed' && currentInvoice.fbrStatus === 'posted') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete invoice: Invoice has been posted to FBR and is locked for deletion'
        });
      }

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

  static async updateInvoiceFbrStatus(req, res, next) {
    try {
      const { fbrStatus } = req.body;
      
      if (!fbrStatus) {
        return res.status(400).json({
          success: false,
          message: 'FBR status is required'
        });
      }

      const invoice = await InvoiceService.updateInvoiceFbrStatus(req.params.id, fbrStatus);

      res.json({
        success: true,
        message: 'Invoice FBR status updated successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  static async postToFbr(req, res, next) {
    try {
      const result = await InvoiceService.postToFbr(req.params.id);

      res.json({
        success: true,
        message: 'Invoice posted to FBR successfully',
        data: result.invoice,
        fbrResponse: result.postResponse
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to post invoice to FBR',
        fbrErrorCode: error.fbrErrorCode,
        fbrStatus: error.fbrStatus
      });
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