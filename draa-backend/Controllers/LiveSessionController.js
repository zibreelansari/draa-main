const Meeting = require("../Models/liveSessionModels");
const PurchasedCourse = require("../Models/studentCoursePurchaseModels"); // Adjust path as needed
const { createZoomMeeting } = require("./zoomapi");


//  Create Meeting with Course
exports.createMeeting = async (req, res) => {
  const { topic, startTime, duration, createdBy, courseId, description } = req.body;

  try {
    // Validate required fields
    if (!topic || !startTime || !duration || !courseId) {
      return res.status(400).json({
        success: false,
        error:"Missing required fields: topic, startTime, duration, courseId"
      });
    }

    // Create Zoom meeting
    const zoomData = await createZoomMeeting(topic, startTime);

    // Save meeting to database
    const newMeeting = await Meeting.create({
      topic,
      startTime,
      createdBy: req.user.role ==="TEACHER" ? req.user.id : (req.body.createdBy || null),
      courseId,
      zoomMeetingId: zoomData.id,
      duration,
      joinUrl: zoomData.join_url,
      description,
      status:"scheduled"
    });

    // Populate course details before sending response
    await newMeeting.populate('courseId','title description');
    await newMeeting.populate('createdBy','tname name email');

    // Trigger notifications for admin and students
    try {
      const Notification = require("../Models/NotificationModel");
      const teacherName = newMeeting.createdBy?.tname || newMeeting.createdBy?.name || "Instructor";
      
      // Notify Admin
      await Notification.create({
        recipient: 'admin',
        recipientModel: 'Admin',
        sender: newMeeting.createdBy?._id || req.user?.id || null,
        senderModel: req.user?.role === "TEACHER" ? 'Teacher' : 'Admin',
        senderName: teacherName,
        type: 'course_upload',
        title: 'New Live Session Scheduled',
        message: `A new live session "${topic}" has been scheduled for course "${newMeeting.courseId?.title || 'Course'}" by ${teacherName}.`,
        referenceId: newMeeting._id
      });
      
      // Notify All Students
      await Notification.create({
        recipient: 'all_students',
        recipientModel: 'User',
        sender: null,
        senderModel: 'Admin',
        senderName: 'EduDocs Team',
        type: 'course_upload',
        title: 'New Live Session Scheduled!',
        message: `A live session "${topic}" has been scheduled for the course "${newMeeting.courseId?.title || 'Course'}".`,
        referenceId: newMeeting._id
      });
      console.log('Notifications triggered for live session creation');
    } catch (notifErr) {
      console.error('Failed to trigger notifications for live session creation:', notifErr);
    }

    res.status(201).json({
      success: true,
      message:"Live session created successfully!",
      meeting: newMeeting
    });
  } catch (err) {
    console.error("Error creating meeting:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};


//  List ALL Meetings (Admin/Teacher View)
exports.listMeetings = async (req, res) => {
  try {
    const query = {};
    if (req.user.role ==="TEACHER") {
      query.createdBy = req.user.id;
    } else if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    const meetings = await Meeting.find(query)
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email')
      .sort({ startTime: -1 }); // Latest first

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Get Student's Live Sessions (Based on Purchased Courses)
exports.getStudentLiveSessions = async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log(' Fetching live sessions for student:', studentId);

    // Step 1: Get all courses purchased by the student
    const purchasedCourses = await PurchasedCourse.find({
      studentId: studentId,
      status:'completed' // Only get successfully purchased courses
    }).select('courseId');

    if (!purchasedCourses || purchasedCourses.length === 0) {
      return res.json({
        success: true,
        message:"No purchased courses found",
        count: 0,
        meetings: []
      });
    }

    // Extract course IDs
    const purchasedCourseIds = purchasedCourses.map(pc => pc.courseId.toString());
    console.log(' Purchased course IDs:', purchasedCourseIds);

    // Step 2: Get live sessions for these courses
    const liveSessions = await Meeting.find({
      courseId: { $in: purchasedCourseIds }
    })
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email')
      .sort({ startTime: 1 }); // Upcoming first

    console.log(` Found ${liveSessions.length} live sessions for student`);

    res.json({
      success: true,
      count: liveSessions.length,
      purchasedCoursesCount: purchasedCourseIds.length,
      meetings: liveSessions
    });

  } catch (err) {
    console.error("Error fetching student live sessions:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Get Live Sessions by Course ID
exports.getLiveSessionsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    console.log(' Fetching live sessions for course:', courseId);

    const liveSessions = await Meeting.find({ courseId })
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email')
      .sort({ startTime: 1 }); // Upcoming first

    res.json({
      success: true,
      count: liveSessions.length,
      meetings: liveSessions
    });

  } catch (err) {
    console.error("Error fetching course live sessions:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Check if Student Has Access to Live Session
exports.checkStudentAccess = async (req, res) => {
  const { studentId, sessionId } = req.params;

  try {
    console.log(' Checking access for student:', studentId,'session:', sessionId);

    // Get the live session
    const session = await Meeting.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        hasAccess: false,
        error:"Live session not found"
      });
    }

    // Check if student purchased the course
    const hasPurchased = await PurchasedCourse.findOne({
      studentId: studentId,
      courseId: session.courseId,
      status:'completed'
    });

    res.json({
      success: true,
      hasAccess: !!hasPurchased,
      session: hasPurchased ? session : null,
      message: hasPurchased
        ?"Access granted"
        :"You need to purchase this course to access this live session"
    });

  } catch (err) {
    console.error("Error checking student access:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  Update Meeting with Course
exports.updateMeeting = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  // Reset status to pending after edit
  updates.status ='pending';

  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ success: false, error:"Meeting not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && meeting.createdBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error:"Access denied. You do not own this record." });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('courseId','title description')
      .populate('createdBy','tname name email');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error:"Meeting not found"
      });
    }

    res.json({
      success: true,
      message:"Meeting updated successfully!",
      meeting
    });
  } catch (err) {
    console.error("Error updating meeting:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};


//  Delete Meeting
exports.deleteMeeting = async (req, res) => {
  const { id } = req.params;

  try {
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ success: false, error:"Meeting not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && meeting.createdBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error:"Access denied. You do not own this record." });
    }

    await Meeting.findByIdAndDelete(id);

    res.json({
      success: true,
      message:"Meeting deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting meeting:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Get Meeting by ID
exports.getMeetingById = async (req, res) => {
  const { id } = req.params;

  try {
    const meeting = await Meeting.findById(id)
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error:"Meeting not found"
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (err) {
    console.error("Error fetching meeting:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Get Upcoming Live Sessions (for homepage/dashboard)
exports.getUpcomingLiveSessions = async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const now = new Date();

    const upcomingSessions = await Meeting.find({
      startTime: { $gte: now },
      status:'scheduled'
    })
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email')
      .sort({ startTime: 1 }) // Nearest first
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: upcomingSessions.length,
      meetings: upcomingSessions
    });
  } catch (err) {
    console.error("Error fetching upcoming sessions:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


//  NEW: Get Live Sessions by Teacher
exports.getLiveSessionsByTeacher = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const sessions = await Meeting.find({ createdBy: teacherId })
      .populate('courseId','title description thumbnail')
      .populate('createdBy','tname name email')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      count: sessions.length,
      meetings: sessions
    });
  } catch (err) {
    console.error("Error fetching teacher sessions:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
