// routes/attendance.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Attendance = require("../Models/attandances.models");
const Leave = require("../Models/leaves.models");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,"uploads/attendance/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

//  Check-In
router.post("/check-in", upload.single("check_in_photo"), async (req, res) => {
  try {
    const {
      teacher_id,
      teacher_name,
      date,
      check_in_time,
      latitude,
      longitude,
      address,
      status,
    } = req.body;

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({ teacher_id, date });
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:"Already checked in today",
      });
    }

    const attendance = new Attendance({
      teacher_id,
      teacher_name,
      date,
      check_in_time,
      status: status ||"present",
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
      },
      check_in_photo: req.file ? `/uploads/attendance/${req.file.filename}` : null,
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message:"Checked in successfully",
      record: attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message:"Error during check-in",
      error: error.message,
    });
  }
});

//  Check-Out
router.put("/check-out", upload.single("check_out_photo"), async (req, res) => {
  try {
    const {
      attendance_id,
      check_out_time,
      latitude,
      longitude,
      address,
      work_hours,
    } = req.body;

    const attendance = await Attendance.findById(attendance_id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:"Attendance record not found",
      });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({
        success: false,
        message:"Already checked out",
      });
    }

    attendance.check_out_time = check_out_time;
    attendance.work_hours = work_hours;
    attendance.check_out_photo = req.file
      ? `/uploads/attendance/${req.file.filename}`
      : null;

    await attendance.save();

    res.json({
      success: true,
      message:"Checked out successfully",
      record: attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message:"Error during check-out",
      error: error.message,
    });
  }
});

//  Get Teacher Attendance Records
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const records = await Attendance.find({ teacher_id: teacherId })
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching attendance records",
      error: error.message,
    });
  }
});

//  Get Today's Attendance
router.get("/teacher/:teacherId/date/:date", async (req, res) => {
  try {
    const { teacherId, date } = req.params;
    const record = await Attendance.findOne({ teacher_id: teacherId, date });

    if (!record) {
      return res.status(404).json({
        success: false,
        message:"No attendance record found for today",
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching attendance",
      error: error.message,
    });
  }
});

//  Apply for Leave
router.post("/apply-leave", async (req, res) => {
  try {
    const {
      teacher_id,
      teacher_name,
      start_date,
      end_date,
      leave_type,
      reason,
    } = req.body;

    const leave = new Leave({
      teacher_id,
      teacher_name,
      start_date,
      end_date,
      leave_type,
      reason,
      status:"pending",
      applied_date: new Date(),
    });

    await leave.save();

    res.status(201).json({
      success: true,
      message:"Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Leave application error:", error);
    res.status(500).json({
      success: false,
      message:"Error applying for leave",
      error: error.message,
    });
  }
});

//  Download Attendance Report (PDF)
router.get("/report/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const records = await Attendance.find({ teacher_id: teacherId }).sort({
      date: -1,
    });

    // Generate PDF using puppeteer or pdfkit
    // For now, returning JSON
    res.json({
      success: true,
      records,
      message:"Report generation in progress",
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({
      success: false,
      message:"Error generating report",
      error: error.message,
    });
  }
});




// routes/attendance.js (Add these admin routes)

//  Get Teachers Attendance Summary
router.get("/admin/teachers-summary", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Aggregate attendance data for all teachers
    const teachers = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: start_date,
            $lte: end_date,
          },
        },
      },
      {
        $group: {
          _id:"$teacher_id",
          teacher_name: { $first:"$teacher_name" },
          total_days: { $sum: 1 },
          present_days: {
            $sum: { $cond: [{ $eq: ["$status","present"] }, 1, 0] },
          },
          absent_days: {
            $sum: { $cond: [{ $eq: ["$status","absent"] }, 1, 0] },
          },
          late_days: {
            $sum: { $cond: [{ $eq: ["$status","late"] }, 1, 0] },
          },
          half_days: {
            $sum: { $cond: [{ $eq: ["$status","half-day"] }, 1, 0] },
          },
          leave_days: {
            $sum: { $cond: [{ $eq: ["$status","leave"] }, 1, 0] },
          },
          total_work_hours: { $sum: { $toDouble:"$work_hours" } },
          last_attendance_date: { $max:"$date" },
          avg_check_in_time: { $avg: { $toLong:"$check_in_time" } },
        },
      },
      {
        $addFields: {
          attendance_percentage: {
            $multiply: [
              {
                $divide: [
                  { $add: ["$present_days", { $multiply: ["$half_days", 0.5] }] },
"$total_days",
                ],
              },
              100,
            ],
          },
          status: {
            $cond: {
              if: { $gte: [{ $multiply: [{ $divide: ["$present_days","$total_days"] }, 100] }, 95] },
              then:"excellent",
              else: {
                $cond: {
                  if: { $gte: [{ $multiply: [{ $divide: ["$present_days","$total_days"] }, 100] }, 85] },
                  then:"good",
                  else: {
                    $cond: {
                      if: { $gte: [{ $multiply: [{ $divide: ["$present_days","$total_days"] }, 100] }, 75] },
                      then:"average",
                      else:"poor",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { attendance_percentage: -1 },
      },
    ]);

    res.json({
      success: true,
      teachers: teachers.map((t) => ({
        teacher_id: t._id,
        teacher_name: t.teacher_name,
        total_days: t.total_days,
        present_days: t.present_days,
        absent_days: t.absent_days,
        late_days: t.late_days,
        half_days: t.half_days,
        leave_days: t.leave_days,
        attendance_percentage: Math.round(t.attendance_percentage * 100) / 100,
        total_work_hours: Math.round(t.total_work_hours * 100) / 100,
        last_attendance_date: t.last_attendance_date,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching teachers summary:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching teachers attendance summary",
      error: error.message,
    });
  }
});

//  Get All Attendance Records
router.get("/admin/all-records", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const records = await Attendance.find({
      date: {
        $gte: start_date,
        $lte: end_date,
      },
    })
      .sort({ date: -1, check_in_time: -1 })
      .limit(500);

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Error fetching all records:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching attendance records",
      error: error.message,
    });
  }
});

//  Get Leave Requests
router.get("/admin/leave-requests", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ applied_date: -1 }).limit(100);

    res.json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching leave requests",
      error: error.message,
    });
  }
});

//  Get Overall Statistics
router.get("/admin/overall-stats", async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const todayRecords = await Attendance.find({ date: today });
    const allTeachers = await Attendance.distinct("teacher_id");
    const pendingLeaves = await Leave.countDocuments({ status:"pending" });

    const present_today = todayRecords.filter((r) => r.status ==="present").length;
    const absent_today = todayRecords.filter((r) => r.status ==="absent").length;
    const late_today = todayRecords.filter((r) => r.status ==="late").length;
    const on_leave = todayRecords.filter((r) => r.status ==="leave").length;

    const currentMonth = moment().format("YYYY-MM");
    const monthRecords = await Attendance.find({
      date: { $regex: `^${currentMonth}` },
    });

    const totalPresent = monthRecords.filter((r) => r.status ==="present").length;
    const totalRecords = monthRecords.length;
    const avg_attendance = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    const total_work_hours = monthRecords.reduce((sum, r) => {
      return sum + (parseFloat(r.work_hours) || 0);
    }, 0);

    res.json({
      success: true,
      stats: {
        total_teachers: allTeachers.length,
        present_today,
        absent_today,
        late_today,
        on_leave,
        avg_attendance: Math.round(avg_attendance * 100) / 100,
        pending_leaves: pendingLeaves,
        total_work_hours: Math.round(total_work_hours * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error fetching overall stats:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching overall statistics",
      error: error.message,
    });
  }
});

//  Get Department Statistics (Optional - requires department field in teacher model)
router.get("/admin/department-stats", async (req, res) => {
  try {
    // This is a placeholder - implement based on your teacher model structure
    const departments = [
      {
        department:"Computer Science",
        total_teachers: 15,
        avg_attendance: 92.5,
        present_today: 14,
        absent_today: 1,
      },
      {
        department:"Mathematics",
        total_teachers: 10,
        avg_attendance: 88.0,
        present_today: 9,
        absent_today: 1,
      },
    ];

    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({
      success: false,
      message:"Error fetching department statistics",
      error: error.message,
    });
  }
});

//  Approve/Reject Leave
router.put("/admin/leave-action", async (req, res) => {
  try {
    const { leave_id, action, rejection_reason, approved_by } = req.body;

    const leave = await Leave.findById(leave_id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message:"Leave request not found",
      });
    }

    leave.status = action;
    leave.approved_by = approved_by;
    leave.approval_date = new Date();

    if (action ==="rejected" && rejection_reason) {
      leave.rejection_reason = rejection_reason;
    }

    // If approved, create attendance records for leave days
    if (action ==="approved") {
      const startDate = moment(leave.start_date);
      const endDate = moment(leave.end_date);
      const days = endDate.diff(startDate,"days") + 1;

      for (let i = 0; i < days; i++) {
        const date = startDate.clone().add(i,"days").format("YYYY-MM-DD");

        const existingRecord = await Attendance.findOne({
          teacher_id: leave.teacher_id,
          date,
        });

        if (!existingRecord) {
          await Attendance.create({
            teacher_id: leave.teacher_id,
            teacher_name: leave.teacher_name,
            date,
            check_in_time:"00:00:00",
            status:"leave",
            notes: `${leave.leave_type} leave - ${leave.reason}`,
          });
        }
      }
    }

    await leave.save();

    res.json({
      success: true,
      message: `Leave ${action} successfully`,
      leave,
    });
  } catch (error) {
    console.error("Leave action error:", error);
    res.status(500).json({
      success: false,
      message:"Error processing leave request",
      error: error.message,
    });
  }
});

//  Export to Excel
router.get("/admin/export-excel", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const ExcelJS = require("exceljs");

    const records = await Attendance.find({
      date: { $gte: start_date, $lte: end_date },
    }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header:"Teacher Name", key:"teacher_name", width: 25 },
      { header:"Date", key:"date", width: 15 },
      { header:"Check-In", key:"check_in_time", width: 12 },
      { header:"Check-Out", key:"check_out_time", width: 12 },
      { header:"Work Hours", key:"work_hours", width: 12 },
      { header:"Status", key:"status", width: 12 },
      { header:"Location", key:"location", width: 30 },
    ];

    records.forEach((record) => {
      worksheet.addRow({
        teacher_name: record.teacher_name,
        date: record.date,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time ||"-",
        work_hours: record.work_hours ||"-",
        status: record.status,
        location: record.location?.address ||"-",
      });
    });

    res.setHeader(
"Content-Type",
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
"Content-Disposition",
      `attachment; filename=Attendance_Report_${moment().format("YYYY-MM-DD")}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({
      success: false,
      message:"Error exporting to Excel",
      error: error.message,
    });
  }
});

//  Export to PDF (using puppeteer or pdfkit)
router.get("/admin/export-pdf", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    res.setHeader("Content-Type","application/pdf");
    res.setHeader(
"Content-Disposition",
      `attachment; filename=Attendance_Report_${moment().format("YYYY-MM-DD")}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Attendance Report", { align:"center" });
    doc.fontSize(12).text(`Period: ${start_date} to ${end_date}`, { align:"center" });
    doc.moveDown();

    const records = await Attendance.find({
      date: { $gte: start_date, $lte: end_date },
    })
      .sort({ date: -1 })
      .limit(100);

    records.forEach((record) => {
      doc
        .fontSize(10)
        .text(
          `${record.teacher_name} - ${record.date} - ${record.status.toUpperCase()} - ${record.check_in_time
          }`
        );
    });

    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({
      success: false,
      message:"Error exporting to PDF",
      error: error.message,
    });
  }
});

module.exports = router;



