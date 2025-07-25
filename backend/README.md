# Invoice Management System - Backend

A robust invoice management system built with Node.js, Express, PostgreSQL, and Prisma.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd backend
   npm install

# App Structure

backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── invoiceController.js
│   ├── middlewares/
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── invoices.js
│   ├── services/
│   │   ├── invoiceService.js
│   │   ├── pdfService.js
│   │   └── thirdPartyService.js
│   ├── utils/
│   │   └── validators.js
│   └── server.js
├── uploads/
├── .env
├── .env.example
├── package.json
└── README.md