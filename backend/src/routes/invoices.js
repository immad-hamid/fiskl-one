const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const { validateRequest } = require('../middlewares/validation');
const { createInvoiceSchema, updateInvoiceSchema } = require('../utils/validators');

// GET /api/invoices - Get paginated invoices with filters
router.get('/', InvoiceController.getInvoices);

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', InvoiceController.getInvoiceStats);

// GET /api/invoices/:id - Get single invoice
router.get('/:id', InvoiceController.getInvoiceById);

// POST /api/invoices - Create new invoice
router.post('/', validateRequest(createInvoiceSchema), InvoiceController.createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', validateRequest(updateInvoiceSchema), InvoiceController.updateInvoice);

// PATCH /api/invoices/:id/status - Update invoice status
router.patch('/:id/status', InvoiceController.updateInvoiceStatus);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', InvoiceController.deleteInvoice);

// GET /api/invoices/:id/pdf - Download PDF
router.get('/:id/pdf', InvoiceController.downloadPDF);

module.exports = router;