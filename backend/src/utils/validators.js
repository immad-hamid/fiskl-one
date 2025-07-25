const Joi = require('joi');

const invoiceItemSchema = Joi.object({
  hsCode: Joi.string().required().messages({
    'string.empty': 'HS Code is required',
    'any.required': 'HS Code is required'
  }),
  productDescription: Joi.string().required().messages({
    'string.empty': 'Product description is required',
    'any.required': 'Product description is required'
  }),
  rate: Joi.string().required().messages({
    'string.empty': 'Rate is required',
    'any.required': 'Rate is required'
  }),
  uoM: Joi.string().required().messages({
    'string.empty': 'Unit of Measure is required',
    'any.required': 'Unit of Measure is required'
  }),
  quantity: Joi.number().positive().required().messages({
    'number.positive': 'Quantity must be a positive number',
    'any.required': 'Quantity is required'
  }),
  totalValues: Joi.number().min(0).required().messages({
    'number.min': 'Total values cannot be negative',
    'any.required': 'Total values is required'
  }),
  valueSalesExcludingST: Joi.number().min(0).required().messages({
    'number.min': 'Value sales excluding ST cannot be negative',
    'any.required': 'Value sales excluding ST is required'
  }),
  fixedNotifiedValueOrRetailPrice: Joi.number().min(0).required().messages({
    'number.min': 'Fixed notified value or retail price cannot be negative',
    'any.required': 'Fixed notified value or retail price is required'
  }),
  salesTaxApplicable: Joi.number().min(0).required().messages({
    'number.min': 'Sales tax applicable cannot be negative',
    'any.required': 'Sales tax applicable is required'
  }),
  salesTaxWithheldAtSource: Joi.number().min(0).required().messages({
    'number.min': 'Sales tax withheld at source cannot be negative',
    'any.required': 'Sales tax withheld at source is required'
  }),
  extraTax: Joi.string().allow('', null).optional(),
  furtherTax: Joi.number().min(0).required().messages({
    'number.min': 'Further tax cannot be negative',
    'any.required': 'Further tax is required'
  }),
  sroScheduleNo: Joi.string().allow('', null).optional(),
  fedPayable: Joi.number().min(0).required().messages({
    'number.min': 'FED payable cannot be negative',
    'any.required': 'FED payable is required'
  }),
  discount: Joi.number().min(0).required().messages({
    'number.min': 'Discount cannot be negative',
    'any.required': 'Discount is required'
  }),
  saleType: Joi.string().allow('', null).optional(),
  sroItemSerialNo: Joi.string().allow('', null).optional()
});

const createInvoiceSchema = Joi.object({
  invoiceType: Joi.string().required().messages({
    'string.empty': 'Invoice type is required',
    'any.required': 'Invoice type is required'
  }),
  invoiceDate: Joi.date().iso().required().messages({
    'date.format': 'Invoice date must be in YYYY-MM-DD format',
    'any.required': 'Invoice date is required'
  }),
  sellerNTNCNIC: Joi.string().required().messages({
    'string.empty': 'Seller NTN/CNIC is required',
    'any.required': 'Seller NTN/CNIC is required'
  }),
  sellerBusinessName: Joi.string().required().messages({
    'string.empty': 'Seller business name is required',
    'any.required': 'Seller business name is required'
  }),
  sellerProvince: Joi.string().required().messages({
    'string.empty': 'Seller province is required',
    'any.required': 'Seller province is required'
  }),
  sellerAddress: Joi.string().required().messages({
    'string.empty': 'Seller address is required',
    'any.required': 'Seller address is required'
  }),
  buyerNTNCNIC: Joi.string().required().messages({
    'string.empty': 'Buyer NTN/CNIC is required',
    'any.required': 'Buyer NTN/CNIC is required'
  }),
  buyerBusinessName: Joi.string().required().messages({
    'string.empty': 'Buyer business name is required',
    'any.required': 'Buyer business name is required'
  }),
  buyerProvince: Joi.string().required().messages({
    'string.empty': 'Buyer province is required',
    'any.required': 'Buyer province is required'
  }),
  buyerAddress: Joi.string().required().messages({
    'string.empty': 'Buyer address is required',
    'any.required': 'Buyer address is required'
  }),
  buyerRegistrationType: Joi.string().required().messages({
    'string.empty': 'Buyer registration type is required',
    'any.required': 'Buyer registration type is required'
  }),
  invoiceRefNo: Joi.string().allow('', null).optional(),
  scenarioId: Joi.string().required().messages({
    'string.empty': 'Scenario ID is required',
    'any.required': 'Scenario ID is required'
  }),
  items: Joi.array().items(invoiceItemSchema).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items are required'
  })
});

const updateInvoiceSchema = createInvoiceSchema.fork(
  ['invoiceType', 'invoiceDate', 'sellerNTNCNIC', 'sellerBusinessName', 'sellerProvince', 
   'sellerAddress', 'buyerNTNCNIC', 'buyerBusinessName', 'buyerProvince', 'buyerAddress', 
   'buyerRegistrationType', 'scenarioId', 'items'], 
  (schema) => schema.optional()
);

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceItemSchema
};