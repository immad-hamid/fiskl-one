# Uploads Directory

This directory contains static assets used by the PDF service for invoice generation.

## Required Files

### FBR Logo
Place the FBR (Federal Board of Revenue) logo in one of these formats:
- `fbr-logo.png` (preferred)
- `fbr-logo.jpg` 
- `fbr-logo.jpeg`

### Company Logo
Place your company logo in one of these formats:
- `logo.png` (preferred)
- `logo.jpg`
- `logo.jpeg`

## Notes
- The FBR logo should be a high-quality image with transparent background if possible
- Recommended size for FBR logo: 80x40 pixels or similar aspect ratio
- The QR code is generated automatically from the invoice number
- If logo files are missing, the PDF will still generate without them

## Usage
These files are automatically loaded by the PDF service when generating invoices. The FBR logo and QR code appear in the top-right corner of the generated PDFs.
