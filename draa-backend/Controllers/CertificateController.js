const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const CourseProgress = require('../Models/CourseProgressModels');
const Course = require('../Models/CourseModel');
const User = require('../Models/UserModel');

// Helper to generate PDF Buffer
exports.generateCertificateBuffer = async (studentId, courseId) => {
  // 1. Fetch fresh details
  const course = await Course.findById(courseId);
  const student = await User.findById(studentId);
  const progress = await CourseProgress.findOne({ student_id: studentId, course_id: courseId });

  if (!course || !student || !progress) return null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout:'landscape',
      size:'A4',
      margin: 0
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- DESIGN THE CERTIFICATE (Same as before) ---
    const width = doc.page.width;
    const height = doc.page.height;
    doc.rect(0, 0, width, height).fill('#ffffff');
    doc.lineWidth(20);
    doc.strokeColor('#0a081e').rect(20, 20, width - 40, height - 40).stroke();
    doc.lineWidth(2);
    doc.strokeColor('#5E6BFF').rect(35, 35, width - 70, height - 70).stroke();
    doc.fillColor('#0a081e').polygon([20, 20], [120, 20], [20, 120]).fill();
    doc.fillColor('#5E6BFF').polygon([width-20, 20], [width-120, 20], [width-20, 120]).fill();

    try {
      const logoPath = path.join(__dirname,'../../client/public/EduDocsNewLogo.png');
      if (fs.existsSync(logoPath)) doc.image(logoPath, width/2 - 40, 60, { width: 80 });
    } catch (e) {}

    doc.moveDown(5);
    doc.font('Helvetica-Bold').fillColor('#0a081e').fontSize(42).text('CERTIFICATE', { align:'center' });
    doc.fontSize(14).font('Helvetica').fillColor('#5E6BFF').text('OF ACHIEVEMENT', { align:'center', characterSpacing: 4 });
    doc.moveDown(2);
    doc.fontSize(18).font('Helvetica').fillColor('#64748b').text('This is to certify that', { align:'center' });
    doc.moveDown(0.5);
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#0a081e').text(student.name.toUpperCase(), { align:'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica').fillColor('#64748b').text('has successfully completed the course', { align:'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#5E6BFF').text(course.title, { align:'center' });

    const completionDate = progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : new Date().toLocaleDateString();
    const certId = `CERT-${progress._id.toString().slice(-8).toUpperCase()}`;
    doc.moveDown(2);
    const footerY = doc.y + 40;
    doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('Issued on:', 100, footerY);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0a081e').text(completionDate, 100, footerY + 18);
    doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('Certificate ID:', width - 280, footerY);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0a081e').text(certId, width - 280, footerY + 18);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(width/2 - 80, footerY + 40).lineTo(width/2 + 80, footerY + 40).stroke();
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Authorized Signature', width/2 - 80, footerY + 48, { width: 160, align:'center' });
    doc.fillColor('#f8fafc').circle(width/2, footerY - 20, 35).fill();
    doc.strokeColor('#5E6BFF').lineWidth(1.5).circle(width/2, footerY - 20, 30).stroke();
    doc.fillColor('#5E6BFF').fontSize(8).font('Helvetica-Bold').text('VERIFIED', width/2 - 20, footerY - 25, { width: 40, align:'center' });

    doc.end();
  });
};

//  Generate Certificate PDF HTTP Endpoint
exports.generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const buffer = await exports.generateCertificateBuffer(studentId, courseId);

    if (!buffer) {
        return res.status(404).json({ success: false, message:"Could not generate certificate. Please ensure 100% completion." });
    }

    const filename = `Certificate-${studentId.slice(-6)}-${courseId.slice(-6)}.pdf`;
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    res.status(500).json({
      success: false,
      message:"Failed to generate certificate",
      error: error.message
    });
  }
};
