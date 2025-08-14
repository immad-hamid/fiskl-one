const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFService {
  static async generateInvoicePDF(invoice) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = this.generateInvoiceHTML(invoice);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      });

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  static generateInvoiceHTML(invoice) {
    const logoBase64 = this.getLogoBase64();
    const companyInfo = this.getCompanyInfo();

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 20px; 
                font-size: 12px;
                line-height: 1.4;
                color: #333;
            }
            .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
            }
            .logo { max-height: 80px; max-width: 200px; }
            .company-info { text-align: right; }
            .company-info h2 { margin: 0; color: #007bff; }
            .invoice-title { 
                font-size: 32px; 
                color: #007bff; 
                margin: 20px 0; 
                text-align: center;
                font-weight: bold;
            }
            .invoice-header-info {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin: 20px 0;
            }
            .party-info {
                border: 1px solid #dee2e6;
                padding: 15px;
                border-radius: 5px;
                background-color: #fff;
            }
            .party-info h3 {
                margin: 0 0 10px 0;
                color: #007bff;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 5px;
            }
            .party-info p {
                margin: 5px 0;
            }
            .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
                font-size: 11px;
            }
            .items-table th { 
                background-color: #007bff; 
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
            }
            .items-table td { 
                border: 1px solid #dee2e6; 
                padding: 10px 8px; 
                text-align: left; 
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .totals-section { 
                margin-top: 30px; 
                display: flex;
                justify-content: flex-end;
            }
            .totals-table {
                border-collapse: collapse;
                min-width: 300px;
            }
            .totals-table td {
                padding: 8px 15px;
                border: 1px solid #dee2e6;
            }
            .totals-table .label {
                background-color: #f8f9fa;
                font-weight: bold;
                text-align: right;
            }
            .totals-table .amount {
                text-align: right;
                font-family: 'Courier New', monospace;
            }
            .grand-total {
                background-color: #007bff !important;
                color: white !important;
                font-weight: bold;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #dee2e6;
                padding-top: 20px;
            }
            .status {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status.pending {
                background-color: #fff3cd;
                color: #856404;
            }
            .status.completed {
                background-color: #d4edda;
                color: #155724;
            }
            .status.cancelled {
                background-color: #f8d7da;
                color: #721c24;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Company Logo">` : ''}
            </div>
            <div class="company-info">
                <h2>${companyInfo.name}</h2>
                <p>${companyInfo.address}</p>
                ${companyInfo.phone ? `<p>Phone: ${companyInfo.phone}</p>` : ''}
            </div>
        </div>

        <h1 class="invoice-title">${invoice.invoiceType.toUpperCase()}</h1>
        
        <div class="invoice-header-info">
            <div>
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'Not Assigned'}</p>
                <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                ${invoice.invoiceRefNo ? `<p><strong>Reference No:</strong> ${invoice.invoiceRefNo}</p>` : ''}
            </div>
            <div style="text-align: right;">
                <p><strong>Scenario ID:</strong> ${invoice.scenarioId}</p>
                <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status}</span></p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div class="party-info">
                <h3>SELLER INFORMATION</h3>
                <p><strong>Business Name:</strong> ${invoice.sellerBusinessName}</p>
                <p><strong>NTN/CNIC:</strong> ${invoice.sellerNTNCNIC}</p>
                <p><strong>Province:</strong> ${invoice.sellerProvince}</p>
                <p><strong>Address:</strong> ${invoice.sellerAddress}</p>
            </div>
            
            <div class="party-info">
                <h3>BUYER INFORMATION</h3>
                <p><strong>Business Name:</strong> ${invoice.buyerBusinessName}</p>
                <p><strong>NTN/CNIC:</strong> ${invoice.buyerNTNCNIC}</p>
                <p><strong>Province:</strong> ${invoice.buyerProvince}</p>
                <p><strong>Address:</strong> ${invoice.buyerAddress}</p>
                <p><strong>Registration Type:</strong> ${invoice.buyerRegistrationType}</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 8%;">HS Code</th>
                    <th style="width: 20%;">Description</th>
                    <th style="width: 8%;">Rate</th>
                    <th style="width: 6%;">UoM</th>
                    <th style="width: 6%;">Qty</th>
                    <th style="width: 10%;">Total Value</th>
                    <th style="width: 10%;">Sales Excl. ST</th>
                    <th style="width: 8%;">Sales Tax</th>
                    <th style="width: 8%;">FED</th>
                    <th style="width: 8%;">Discount</th>
                    <th style="width: 8%;">Further Tax</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.hsCode}</td>
                        <td>${item.productDescription}</td>
                        <td>${item.rate}</td>
                        <td>${item.uoM}</td>
                        <td>${parseFloat(item.quantity).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.totalValues).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.valueSalesExcludingST).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.salesTaxApplicable).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.fedPayable).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.discount).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.furtherTax).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                ${this.calculateTotals(invoice.items).map(total => `
                    <tr ${total.isGrandTotal ? 'class="grand-total"' : ''}>
                        <td class="label">${total.label}:</td>
                        <td class="amount">PKR ${total.amount}</td>
                    </tr>
                `).join('')}
            </table>
        </div>

        <div class="footer">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;
  }

  static calculateTotals(items) {
    const totals = [];
    
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.valueSalesExcludingST), 0);
    const totalSalesTax = items.reduce((sum, item) => sum + parseFloat(item.salesTaxApplicable), 0);
    const totalFED = items.reduce((sum, item) => sum + parseFloat(item.fedPayable), 0);
    const totalDiscount = items.reduce((sum, item) => sum + parseFloat(item.discount), 0);
    const totalFurtherTax = items.reduce((sum, item) => sum + parseFloat(item.furtherTax), 0);
    const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.totalValues), 0);

    totals.push({ label: 'Subtotal (Excl. ST)', amount: subtotal.toFixed(2) });
    totals.push({ label: 'Total Sales Tax', amount: totalSalesTax.toFixed(2) });
    totals.push({ label: 'Total FED', amount: totalFED.toFixed(2) });
    totals.push({ label: 'Total Discount', amount: totalDiscount.toFixed(2) });
    totals.push({ label: 'Total Further Tax', amount: totalFurtherTax.toFixed(2) });
    totals.push({ label: 'GRAND TOTAL', amount: grandTotal.toFixed(2), isGrandTotal: true });

    return totals;
  }

  static getCompanyInfo() {
    return {
      name: process.env.COMPANY_NAME || 'Your Company Name',
      address: process.env.COMPANY_ADDRESS || 'Your Company Address',
      phone: process.env.COMPANY_PHONE || ''
    };
  }

  static getLogoBase64() {
    const logoPath = path.join(__dirname, '../../uploads/logo.png');
    
    if (!fs.existsSync(logoPath)) {
      // Try other formats
      const logoPathJpg = path.join(__dirname, '../../uploads/logo.jpg');
      const logoPathJpeg = path.join(__dirname, '../../uploads/logo.jpeg');
      
      if (fs.existsSync(logoPathJpg)) {
        return this.fileToBase64(logoPathJpg, 'image/jpeg');
      } else if (fs.existsSync(logoPathJpeg)) {
        return this.fileToBase64(logoPathJpeg, 'image/jpeg');
      }
      return null;
    }
    
    return this.fileToBase64(logoPath, 'image/png');
  }

  static fileToBase64(filePath, mimeType) {
    try {
      const imageBuffer = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }
}

module.exports = PDFService;