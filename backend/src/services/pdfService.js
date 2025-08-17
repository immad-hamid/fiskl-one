const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const scenarioTypes = [
  {
    id: "SN001",
    desc: "Goods at standard rate to registered buyers",
    saleType: "Goods at Standard Rate (default)",
    active: true
  },
  {
    id: "SN002",
    desc: "Goods at standard rate to unregistered buyers",
    saleType: "Goods at Standard Rate (default)",
    active: true
  },
  {
    id: "SN003",
    desc: "Sale of Steel (Melted and Re-Rolled)",
    saleType: "Steel Melting and re-rolling",
    active: true
  },
  {
    id: "SN004",
    desc: "Sale by Ship Breakers",
    saleType: "Ship breaking",
    active: true
  },
  {
    id: "SN005",
    desc: "Reduced rate sale",
    saleType: "Goods at Reduced Rate",
    active: true
  },
  {
    id: "SN006",
    desc: "Exempt goods sale",
    saleType: "Exempt Goods",
    active: true
  },
  {
    id: "SN007",
    desc: "Zero rated sale",
    saleType: "Goods at zero-rate",
    active: true
  },
  {
    id: "SN008",
    desc: "Sale of 3rd schedule goods",
    saleType: "3rd Schedule Goods",
    active: true
  },
  {
    id: "SN009",
    desc: "Cotton Spinner purchase from Cotton Ginners",
    saleType: "Cotton Ginners",
    active: true
  },
  {
    id: "SN010",
    desc: "Mobile Operators adds Sale (Telecom Sector)",
    saleType: "Telecommunication services",
    active: true
  },
  {
    id: "SN011",
    desc: "Toll Manufacturing sale by Steel sector",
    saleType: "Toll Manufacturing",
    active: true
  },
  {
    id: "SN012",
    desc: "Sale of Petroleum products",
    saleType: "Petroleum Products",
    active: true
  },
  {
    id: "SN013",
    desc: "Electricity Supply to Retailers",
    saleType: "Electricity Supply to Retailers",
    active: true
  },
  {
    id: "SN014",
    desc: "Sale of Gas to CNG stations",
    saleType: "Gas to CNG stations",
    active: true
  },
  {
    id: "SN015",
    desc: "Sale of mobile phones",
    saleType: "Mobile Phones",
    active: true
  },
  {
    id: "SN016",
    desc: "Processing / Conversion of Goods",
    saleType: "Processing/ Conversion of Goods",
    active: true
  },
  {
    id: "SN017",
    desc: "Sale of Goods where FED is charged in ST mode",
    saleType: "Goods (FED in ST Mode)",
    active: true
  },
  {
    id: "SN018",
    desc: "Sale of Services where FED is charged in ST mode",
    saleType: "Services (FED in ST Mode)",
    active: true
  },
  {
    id: "SN019",
    desc: "Sale of Services",
    saleType: "Services",
    active: true
  },
  {
    id: "SN020",
    desc: "Sale of Electric Vehicles",
    saleType: "Electric Vehicle",
    active: true
  },
  {
    id: "SN021",
    desc: "Sale of Cement /Concrete Block",
    saleType: "Cement /Concrete Block",
    active: true
  },
  {
    id: "SN022",
    desc: "Sale of Potassium Chlorate",
    saleType: "Potassium Chlorate",
    active: true
  },
  {
    id: "SN023",
    desc: "Sale of CNG",
    saleType: "CNG Sales",
    active: true
  },
  {
    id: "SN024",
    desc: "Goods sold that are listed in SRO 297(1)/2023",
    saleType: "Goods as per SRO.297(I)/2023",
    active: true
  },
  {
    id: "SN025",
    desc: "Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1",
    saleType: "Non-Adjustable Supplies",
    active: true
  },
  {
    id: "SN026",
    desc: "Sale to End Consumer by retailers",
    saleType: "Goods at Standard Rate (default)",
    active: false
  },
  {
    id: "SN027",
    desc: "Sale to End Consumer by retailers",
    saleType: "3rd Schedule Goods",
    active: false
  },
  {
    id: "SN028",
    desc: "Sale to End Consumer by retailers",
    saleType: "Goods at Reduced Rate",
    active: false
  }
];

class PDFService {
  static async generateInvoicePDF(invoice) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = await this.generateInvoiceHTML(invoice);
      
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

  static async generateInvoiceHTML(invoice) {
    const logoBase64 = this.getLogoBase64();
    const companyInfo = this.getCompanyInfo();
    const fbrLogoBase64 = this.getFbrLogoBase64();
    const qrCodeDataURL = await this.generateQRCode(invoice.invoiceNumber || 'Not Assigned');
    const saleTypeDesc = this.getScenarioDescription(invoice.scenarioId);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                font-size: 12px;
                line-height: 1.5;
                color: #2c3e50;
                background-color: #ffffff;
            }
            .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start; 
                margin-bottom: 20px; 
                border-bottom: 3px solid #34495e;
                padding-bottom: 15px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 15px;
                border-radius: 8px;
                margin: -20px -20px 20px -20px;
            }
            .company-section {
                display: flex;
                align-items: flex-start;
                gap: 20px;
            }
            .logo { 
                max-height: 90px; 
                max-width: 150px; 
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                border-radius: 6px;
            }
            .company-info { 
                color: #34495e;
            }
            .company-info h2 { 
                margin: 0 0 12px 0; 
                color: #2c3e50; 
                font-size: 22px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .company-info p {
                margin: 6px 0;
                font-size: 12px;
                color: #5a6c7d;
            }
            .invoice-meta {
                text-align: right;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
            }
            .fbr-section {
                display: flex;
                align-items: flex-end;
                gap: 15px;
                margin-top: 20px;
                padding: 15px;
                background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);
                border-radius: 8px;
                border: 1px solid #dadce0;
            }
            .fbr-logo {
                height: 72px;
                width: 72px;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            }
            .qr-code {
                height: 72px;
                width: 72px;
                border: 2px solid #34495e;
                border-radius: 4px;
                background: white;
                padding: 2px;
            }
            .invoice-header-info {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
                padding: 15px;
                border-radius: 10px;
                border-left: 5px solid #3498db;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            }
            .invoice-header-info p {
                margin: 8px 0;
                font-weight: 500;
            }
            .invoice-header-info strong {
                color: #2c3e50;
                font-weight: 600;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 15px 0;
            }
            .party-info {
                border: 1px solid #bdc3c7;
                padding: 15px;
                border-radius: 10px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                position: relative;
            }
            .party-info::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #e74c3c, #c0392b);
                border-radius: 10px 10px 0 0;
            }
            .party-info h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 5px;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .party-info p {
                margin: 5px 0;
                font-size: 12px;
            }
            .party-info strong {
                color: #34495e;
                font-weight: 600;
            }
            .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0; 
                font-size: 9px;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                border: 2px solid #34495e;
            }
            .items-table th { 
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 12px 6px;
                text-align: center;
                font-weight: 600;
                font-size: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-right: 1px solid #4a5f7a;
                position: relative;
            }
            .items-table th:last-child {
                border-right: none;
            }
            .items-table th::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #3498db, #2980b9);
            }
            .items-table td { 
                border: 1px solid #ecf0f1; 
                padding: 10px 6px; 
                text-align: center; 
                font-size: 8px;
                background: white;
                transition: background-color 0.2s ease;
                border-right: 1px solid #ecf0f1;
            }
            .items-table td:last-child {
                border-right: none;
            }
            .items-table tr:nth-child(even) td {
                background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
            }
            .items-table tr:hover td {
                background: linear-gradient(135deg, #e8f4fd 0%, #d1ecf1 100%);
            }
            .items-table tr:last-child td {
                border-bottom: 2px solid #34495e;
            }
            .totals-section { 
                margin-top: 20px; 
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                gap: 20px;
            }
            .totals-table {
                border-collapse: collapse;
                min-width: 350px;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .totals-table td {
                padding: 12px 20px;
                border: 1px solid #ecf0f1;
                font-size: 13px;
            }
            .totals-table .label {
                background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
                font-weight: 600;
                text-align: right;
                color: #2c3e50;
                border-right: 3px solid #3498db;
            }
            .totals-table .amount {
                text-align: right;
                font-family: 'Courier New', monospace;
                font-weight: 500;
                background: white;
                color: #2c3e50;
            }
            .grand-total {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
                color: white !important;
                font-weight: 700 !important;
                font-size: 15px !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            .grand-total.label {
                border-right: 3px solid #f39c12 !important;
                background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%) !important;
                color: white !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 1px !important;
            }
            .grand-total.amount {
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
                color: #1a1a1a !important;
                font-weight: 800 !important;
                border-left: 3px solid #f39c12 !important;
            }
            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 11px;
                color: #7f8c8d;
                border-top: 2px solid #ecf0f1;
                padding-top: 15px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                margin-left: -20px;
                margin-right: -20px;
                padding-left: 20px;
                padding-right: 20px;
                border-radius: 0 0 10px 10px;
            }
            .footer p {
                margin: 5px 0;
            }
            .status {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 25px;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            .status.pending {
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                border: 2px solid #d68910;
            }
            .status.completed {
                background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
                color: white;
                border: 2px solid #1e8449;
            }
            .status.cancelled {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                border: 2px solid #a93226;
            }
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                color: rgba(52, 73, 94, 0.03);
                font-weight: 900;
                z-index: -1;
                pointer-events: none;
                letter-spacing: 10px;
            }
        </style>
    </head>
    <body>
                <div class="header">
            <div class="company-section">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo" />` : ''}
                <div class="company-info">
                    <h2>${invoice.companyName || 'Your Company Name'}</h2>
                    <p><strong>Address:</strong> ${invoice.companyAddress || 'Company Address'}</p>
                    <p><strong>Phone:</strong> ${invoice.companyPhone || 'Phone Number'}</p>
                    ${invoice.companyEmail ? `<p><strong>Email:</strong> ${invoice.companyEmail}</p>` : ''}
                    ${invoice.companyTaxId ? `<p><strong>Tax ID:</strong> ${invoice.companyTaxId}</p>` : ''}
                </div>
            </div>
            <div class="invoice-meta">
                <div style="margin-top: 15px; font-size: 14px; color: #5a6c7d;">
                    <strong>Invoice Date:</strong><br>
                    ${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>
        </div>

        <div class="watermark">INVOICE</div>

        <div class="invoice-header-info">
            <div>
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'Not Assigned'}</p>
                <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                ${invoice.invoiceRefNo ? `<p><strong>Reference No:</strong> ${invoice.invoiceRefNo}</p>` : ''}
            </div>
            <div style="text-align: right;">
                <p><strong>Sale Type:</strong> ${saleTypeDesc}</p>
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

        <div style="margin: 20px 0 10px 0;">
            <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0; padding: 8px 0; border-bottom: 2px solid #3498db; display: inline-block; letter-spacing: 0.5px;">
                INVOICE ITEMS
            </h3>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 6%;">HS Code</th>
                    <th style="width: 12%;">Description</th>
                    <th style="width: 5%;">Rate</th>
                    <th style="width: 4%;">UoM</th>
                    <th style="width: 4%;">Qty</th>
                    <th style="width: 6%;">Total Value</th>
                    <th style="width: 6%;">Sales Excl. ST</th>
                    <th style="width: 6%;">Fixed/Retail Price</th>
                    <th style="width: 5%;">Sales Tax</th>
                    <th style="width: 5%;">ST Withheld</th>
                    <th style="width: 4%;">FED</th>
                    <th style="width: 4%;">Discount</th>
                    <th style="width: 5%;">Further Tax</th>
                    <th style="width: 4%;">Extra Tax</th>
                    <th style="width: 8%;">Sale Type</th>
                    <th style="width: 6%;">SRO Schedule</th>
                    <th style="width: 6%;">SRO Serial</th>
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
                        <td>PKR ${parseFloat(item.fixedNotifiedValueOrRetailPrice).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.salesTaxApplicable).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.salesTaxWithheldAtSource).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.fedPayable).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.discount).toFixed(2)}</td>
                        <td>PKR ${parseFloat(item.furtherTax).toFixed(2)}</td>
                        <td>${item.extraTax || '-'}</td>
                        <td>${item.saleType || '-'}</td>
                        <td>${item.sroScheduleNo || '-'}</td>
                        <td>${item.sroItemSerialNo || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin: 20px 0 10px 0;">
            <h3 style="color: #2c3e50; font-size: 14px; font-weight: 600; margin: 0; padding: 8px 0; border-bottom: 2px solid #e74c3c; display: inline-block; letter-spacing: 0.5px;">
                INVOICE SUMMARY
            </h3>
        </div>

        <div class="totals-section">
            <!-- FBR Section with Logo and QR Code -->
            <div class="fbr-section">
                ${fbrLogoBase64 ? `<img src="${fbrLogoBase64}" class="fbr-logo" alt="FBR Logo">` : ''}
                ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" class="qr-code" alt="QR Code">` : ''}
            </div>
            
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
            <div style="font-style: italic; margin-bottom: 10px;">This is a computer generated invoice and does not require a signature.</div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bdc3c7; padding-top: 15px; margin-top: 15px;">
                <p style="margin: 0;">Generated on: ${new Date().toLocaleString()}</p>
                <p style="margin: 0; font-weight: 600;">Invoice #${invoice.invoiceNumber}</p>
            </div>
        </div>
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

  static getScenarioDescription(scenarioId) {
    const scenario = scenarioTypes.find(s => s.id === scenarioId);
    return scenario ? scenario.desc : scenarioId;
  }

  static getCompanyInfo() {
    return {
      name: process.env.COMPANY_NAME || 'Your Company Name',
      address: process.env.COMPANY_ADDRESS || 'Your Company Address',
      phone: process.env.COMPANY_PHONE || ''
    };
  }

  static async generateQRCode(text) {
    try {
      // Generate QR code as Data URL with Version 2.0 (25×25 modules)
      const qrDataURL = await QRCode.toDataURL(text, {
        version: 2,  // Version 2.0 = 25×25 modules
        width: 72,   // 1 inch at 72 DPI
        height: 72,  // 1 inch at 72 DPI
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'  // Medium error correction
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  static getFbrLogoBase64() {
    const fbrLogoPath = path.join(__dirname, '../../uploads/fbr-logo.png');
    
    if (!fs.existsSync(fbrLogoPath)) {
      // Try other formats
      const fbrLogoPathJpg = path.join(__dirname, '../../uploads/fbr-logo.jpg');
      const fbrLogoPathJpeg = path.join(__dirname, '../../uploads/fbr-logo.jpeg');
      
      if (fs.existsSync(fbrLogoPathJpg)) {
        return this.fileToBase64(fbrLogoPathJpg, 'image/jpeg');
      } else if (fs.existsSync(fbrLogoPathJpeg)) {
        return this.fileToBase64(fbrLogoPathJpeg, 'image/jpeg');
      }
      
      // If no FBR logo found, return null (will not display)
      return null;
    }
    
    return this.fileToBase64(fbrLogoPath, 'image/png');
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