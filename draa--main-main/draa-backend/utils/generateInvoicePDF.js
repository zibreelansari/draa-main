const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

exports.generateInvoicePDF = async (data) => {
  const { studentName, email, courseTitle, amount, orderId, date } = data;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size:'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- Invoice Layout ---

    // Logo — try a few likely locations so the invoice renders nicely in both
    // local dev and production. Wrapped in try/catch so a missing logo never
    // breaks invoice generation.
    try {
      const candidatePaths = [
        path.join(__dirname,'../../draa-frontend/public/EduDocsNewLogo.png'),
        path.join(__dirname,'../public/assets/EduDocsNewLogo.png'),
        path.join(__dirname,'../../client/public/EduDocsNewLogo.png'),
        path.join(process.cwd(),'../draa-frontend/public/EduDocsNewLogo.png')
      ];
      const logoPath = candidatePaths.find((p) => fs.existsSync(p));
      if (logoPath) {
        doc.image(logoPath, 50, 45, { width: 50 });
      }
    } catch (e) {}

    doc.fillColor('#444444')
       .fontSize(20)
       .text('Draa Academy', 110, 57)
       .fontSize(10)
       .text('A unit of Draa LLP', 110, 80)
       .text('GSTIN: 07AAHCM1234A1Z1', 110, 95) // Placeholder GST
       .moveDown();

    // Invoice Title
    doc.fillColor('#0a081e')
       .fontSize(24)
       .text('INVOICE', 50, 160, { align:'right' });

    doc.fontSize(10)
       .fillColor('#444444')
       .text(`Invoice Number: INV-${orderId.slice(-6).toUpperCase()}`, 50, 190, { align:'right' })
       .text(`Date: ${date || new Date().toLocaleDateString()}`, 50, 205, { align:'right' });

    // Bill To
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('BILL TO:', 50, 240);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(studentName, 50, 255)
       .text(email, 50, 270);

    // Table Header
    const tableTop = 330;
    doc.rect(50, tableTop, 500, 25).fill('#f1f5f9');
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10);
    doc.text('Description', 60, tableTop + 8);
    doc.text('Quantity', 350, tableTop + 8);
    doc.text('Total', 480, tableTop + 8, { width: 60, align:'right' });

    // Table Row
    doc.fillColor('#0a081e').font('Helvetica').fontSize(10);
    doc.text(courseTitle, 60, tableTop + 40);
    doc.text('1', 350, tableTop + 40);
    doc.text(`INR ${amount}`, 480, tableTop + 40, { width: 60, align:'right' });

    doc.moveTo(50, tableTop + 65).lineTo(550, tableTop + 65).stroke('#e2e8f0');

    // Calculations
    const subtotal = amount;
    const cgst = (subtotal * 0.09).toFixed(2);
    const sgst = (subtotal * 0.09).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(cgst) + parseFloat(sgst)).toFixed(2);

    const calcY = tableTop + 80;
    doc.text('Subtotal:', 350, calcY);
    doc.text(`INR ${subtotal}`, 480, calcY, { align:'right' });

    doc.text('CGST (9%):', 350, calcY + 20);
    doc.text(`INR ${cgst}`, 480, calcY + 20, { align:'right' });

    doc.text('SGST (9%):', 350, calcY + 40);
    doc.text(`INR ${sgst}`, 480, calcY + 40, { align:'right' });

    doc.rect(340, calcY + 60, 210, 30).fill('#0a081e');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
    doc.text('GRAND TOTAL:', 350, calcY + 70);
    doc.text(`INR ${total}`, 480, calcY + 70, { align:'right' });

    // Footer
    doc.fillColor('#64748b').font('Helvetica').fontSize(9);
    doc.text('This is a computer generated invoice and does not require a physical signature.', 50, 750, { align:'center', width: 500 });
    doc.text('Thank you for choosing Draa Academy!', 50, 765, { align:'center', width: 500 });

    doc.end();
  });
};
