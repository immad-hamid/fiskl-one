export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  invoiceType: string;
  invoiceDate: string | null;
  sellerNTNCNIC: string;
  sellerBusinessName: string;
  sellerProvince: string;
  sellerAddress: string;
  buyerNTNCNIC: string;
  buyerBusinessName: string;
  buyerProvince: string;
  buyerAddress: string;
  buyerRegistrationType: string;
  invoiceRefNo?: string;
  scenarioId: string;
  status?: string | null;
  fbrStatus?: string | null;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id?: number;
  hsCode: string;
  productDescription: string;
  rate: string;
  uoM: string;
  quantity: number;
  totalValues: number;
  valueSalesExcludingST: number;
  fixedNotifiedValueOrRetailPrice: number;
  salesTaxApplicable: number;
  salesTaxWithheldAtSource: number;
  extraTax?: string;
  furtherTax: number;
  sroScheduleNo?: string;
  fedPayable: number;
  discount: number;
  saleType?: string;
  sroItemSerialNo?: string;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: {
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface InvoiceStats {
  totalInvoices: number;
  pendingInvoices: number;
  completedInvoices: number;
  totalAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}