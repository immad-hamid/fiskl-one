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
            .fbr-section {
                display: flex;
                align-items: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .fbr-logo {
                height: 72px;
                width: 72px;
                object-fit: contain;
            }
            .qr-code {
                height: 72px;
                width: 72px;
            }
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
                font-size: 9px;
            }
            .items-table th { 
                background-color: #007bff; 
                color: white;
                padding: 8px 4px;
                text-align: left;
                font-weight: bold;
                font-size: 8px;
            }
            .items-table td { 
                border: 1px solid #dee2e6; 
                padding: 6px 4px; 
                text-align: left; 
                font-size: 8px;
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .totals-section { 
                margin-top: 30px; 
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
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
                <p><strong>Sale Type:</strong> ${saleTypeDesc}</p>
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