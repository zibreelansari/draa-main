const mongoose = require('mongoose');

// Import your existing models
const Course = require('../Models/CourseModel');
const Book = require('../Models/booksModel');
const TestSeries = require('../Models/TestSeriesModels');
const Exam = require('../Models/ExamModel');
const Submission = require('../Models/exam.submission.models');
const User = require('../Models/UserModel');

//  Get comprehensive teacher dashboard statistics
exports.getTeacherDashboardStats = async (req, res) => {
  try {
    const { teacherId } = req.params;

    console.log(' Loading teacher dashboard stats for:', teacherId);

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid teacher ID format"
      });
    }

    //  Get all statistics in parallel
    const [
      courseStats,
      bookStats,
      testSeriesStats,
      examStats,
      studentStats,
      recentActivity
    ] = await Promise.all([
      getTeacherCourseStats(teacherId),
      getTeacherBookStats(teacherId),
      getTeacherTestSeriesStats(teacherId),
      getTeacherExamStats(teacherId),
      getTeacherStudentStats(teacherId),
      getTeacherRecentActivity(teacherId, 10)
    ]);

    const dashboardData = {
      courses: courseStats,
      books: bookStats,
      testSeries: testSeriesStats,
      exams: examStats,
      students: studentStats,
      totalContent: courseStats.total + bookStats.total + testSeriesStats.total + examStats.total,
      notifications: recentActivity.length
    };

    console.log(' Teacher dashboard stats compiled:', dashboardData);

    res.json({
      success: true,
      data: dashboardData,
      teacherId: teacherId
    });

  } catch (error) {
    console.error(' Error loading teacher dashboard stats:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load teacher dashboard statistics',
      error: error.message
    });
  }
};

//  Get teacher's students with performance data
exports.getTeacherStudents = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { limit = 50 } = req.query;

    const studentsData = await getTeacherStudentsDetailed(teacherId, parseInt(limit));

    res.json({
      success: true,
      data: studentsData
    });

  } catch (error) {
    console.error(' Error loading teacher students:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load students data',
      error: error.message
    });
  }
};

//  Get teacher's recent activities
exports.getTeacherActivity = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { limit = 10 } = req.query;

    const activities = await getTeacherRecentActivity(teacherId, parseInt(limit));

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error(' Error loading teacher activity:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load activity data',
      error: error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

//  Get Course Statistics for Teacher
//  FIXED Course Statistics Helper - Using correct field name
async function getTeacherCourseStats(teacherId) {
  try {
    console.log(' DEBUG: Looking for courses with teacher_id:', teacherId);

    //  CORRECT FIELD NAME: teacher_id (with underscore)
    const courses = await Course.find({
      teacher_id: new mongoose.Types.ObjectId(teacherId)
    });

    console.log(` Found ${courses.length} courses for teacher ${teacherId}`);

    if (courses.length > 0) {
      console.log(' Course details:', courses.map(course => ({
        id: course._id,
        title: course.title,
        teacher_id: course.teacher_id,
        status: course.status,
        price: course.price,
        duration: course.duration
      })));
    }

    const totalCourses = courses.length;
    let activeCourses = 0;
    let totalStudents = 0;
    let totalRevenue = 0;
    let totalHours = 0;

    courses.forEach(course => {
      // Check status (from your schema, it's likely'active','published', etc.)
      if (course.status ==='active' || course.status ==='published' || course.isApproved === true) {
        activeCourses++;
      }

      // Count enrolled students
      totalStudents += course.enrollmentCount || 0;

      // Revenue calculation
      totalRevenue += course.price || 0;

      // Duration calculation
      totalHours += course.duration || 0;
    });

    const totalRating = courses.reduce((sum, c) => sum + (c.rating || 0), 0);
    const avgRating = courses.length > 0 ? (totalRating / courses.length).toFixed(1) : 0;

    const result = {
      total: totalCourses,
      active: activeCourses,
      students: totalStudents,
      revenue: Math.round(totalRevenue),
      totalHours: Math.round(totalHours),
      averageRating: parseFloat(avgRating)
    };

    console.log(' Course stats calculated:', result);
    return result;

  } catch (error) {
    console.error(' Error getting teacher course stats:', error);
    return {
      total: 0,
      active: 0,
      students: 0,
      revenue: 0,
      totalHours: 0,
      averageRating: 0
    };
  }
}


//  Get Book Statistics for Teacher
async function getTeacherBookStats(teacherId) {
  try {
    const books = await Book.find({
      uploadedBy: new mongoose.Types.ObjectId(teacherId)
    });

    const totalBooks = books.length;
    let publishedBooks = 0;
    let totalSales = 0;
    let digitalBooks = 0;
    let physicalBooks = 0;

    books.forEach(book => {
      if (book.status ==='published' || book.status ==='active') {
        publishedBooks++;
      }

      totalSales += book.salesCount || 0;

      if (book.type ==='digital' || book.format ==='pdf') {
        digitalBooks++;
      } else {
        physicalBooks++;
      }
    });

    return {
      total: totalBooks,
      published: publishedBooks,
      digital: digitalBooks,
      physical: physicalBooks,
      totalSales: totalSales
    };

  } catch (error) {
    console.error('Error getting teacher book stats:', error);
    return {
      total: 0,
      published: 0,
      digital: 0,
      physical: 0,
      totalSales: 0
    };
  }
}

//  Get Test Series Statistics for Teacher
async function getTeacherTestSeriesStats(teacherId) {
  try {
    const testSeries = await TestSeries.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    });

    const totalTestSeries = testSeries.length;
    let activeTestSeries = 0;
    let totalAttempts = 0;
    let totalQuestions = 0;

    testSeries.forEach(series => {
      if (series.status ==='active' || series.status ==='published') {
        activeTestSeries++;
      }

      totalAttempts += series.attempts?.length || 0;
      totalQuestions += series.questions?.length || 0;
    });

    return {
      total: totalTestSeries,
      active: activeTestSeries,
      totalAttempts: totalAttempts,
      totalQuestions: totalQuestions,
      averageScore: totalAttempts > 0 ? 75 : 0 // Placeholder until TestAttempt model is fully integrated with scores
    };

  } catch (error) {
    console.error('Error getting teacher test series stats:', error);
    return {
      total: 0,
      active: 0,
      totalAttempts: 0,
      totalQuestions: 0,
      averageScore: 0
    };
  }
}

//  Get Exam Statistics for Teacher
async function getTeacherExamStats(teacherId) {
  try {
    const exams = await Exam.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    });

    const totalExams = exams.length;
    let activeExams = 0;
    let upcomingExams = 0;
    let completedExams = 0;
    let totalSubmissions = 0;

    const now = new Date();

    for (const exam of exams) {
      if (exam.scheduledAt) {
        const examDate = new Date(exam.scheduledAt);
        const examEndDate = new Date(examDate.getTime() + (exam.durationMinutes * 60 * 1000));

        if (now >= examDate && now <= examEndDate) {
          activeExams++;
        } else if (now < examDate) {
          upcomingExams++;
        } else {
          completedExams++;
        }
      }

      // Count submissions for this exam
      const submissions = await Submission.countDocuments({ examId: exam._id });
      totalSubmissions += submissions;
    }

    const submissions = await Submission.find({ examId: { $in: exams.map(e => e._id) } });
    const totalScore = submissions.reduce((sum, s) => sum + (s.score?.percentage || 0), 0);
    const avgScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    return {
      total: totalExams,
      active: activeExams,
      upcoming: upcomingExams,
      completed: completedExams,
      totalSubmissions: submissions.length,
      averageScore: avgScore
    };

  } catch (error) {
    console.error('Error getting teacher exam stats:', error);
    return {
      total: 0,
      active: 0,
      upcoming: 0,
      completed: 0,
      totalSubmissions: 0,
      averageScore: 0
    };
  }
}

//  Get Student Statistics for Teacher
async function getTeacherStudentStats(teacherId) {
  try {
    // Get all courses by this teacher
    const teacherCourses = await Course.find({
      teacher_id: new mongoose.Types.ObjectId(teacherId)
    });

    // Get all exams by this teacher
    const teacherExams = await Exam.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    });

    // Count unique students from exam submissions
    const examStudents = await Submission.distinct('studentId', {
      examId: { $in: teacherExams.map(e => e._id) }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newSubmissionsCount = await Submission.countDocuments({
      examId: { $in: teacherExams.map(e => e._id) },
      submittedAt: { $gte: startOfMonth }
    });

    const totalSubmissions = await Submission.find({
      examId: { $in: teacherExams.map(e => e._id) }
    });
    const totalScore = totalSubmissions.reduce((sum, s) => sum + (s.score?.percentage || 0), 0);
    const avgPerf = totalSubmissions.length > 0 ? Math.round(totalScore / totalSubmissions.length) : 0;

    let totalUniqueStudents = examStudents.length;
    let activeStudents = examStudents.length;

    return {
      total: totalUniqueStudents,
      active: activeStudents,
      newThisMonth: newSubmissionsCount,
      averagePerformance: avgPerf
    };

  } catch (error) {
    console.error('Error getting teacher student stats:', error);
    return {
      total: 0,
      active: 0,
      newThisMonth: 0,
      averagePerformance: 0
    };
  }
}

//  Get Detailed Students Data for DataGrid
async function getTeacherStudentsDetailed(teacherId, limit = 50) {
  try {
    // Get teacher's exams
    const teacherExams = await Exam.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    });

    // Get submissions with student details
    const submissions = await Submission.find({
      examId: { $in: teacherExams.map(e => e._id) }
    })
      .populate('studentId','name email')
      .populate('examId','title')
      .sort({ submittedAt: -1 })
      .limit(limit);

    // Process student data
    const studentMap = new Map();

    submissions.forEach(submission => {
      if (submission.studentId) {
        const studentId = submission.studentId._id.toString();
        const studentName = submission.studentId.name ||'Unknown';
        const studentEmail = submission.studentId.email ||'';

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: studentName,
            email: studentEmail,
            totalExams: 0,
            averageScore: 0,
            scores: [],
            lastActivity: submission.submittedAt,
            status:'Active'
          });
        }

        const student = studentMap.get(studentId);
        student.totalExams++;
        if (submission.score && submission.score.percentage) {
          student.scores.push(submission.score.percentage);
        }

        // Update last activity if more recent
        if (new Date(submission.submittedAt) > new Date(student.lastActivity)) {
          student.lastActivity = submission.submittedAt;
        }
      }
    });

    // Calculate averages and format data
    const studentsArray = Array.from(studentMap.values()).map((student, index) => {
      const averageScore = student.scores.length > 0
        ? Math.round(student.scores.reduce((a, b) => a + b, 0) / student.scores.length)
        : 0;

      const grade = averageScore >= 90 ?'A+' :
        averageScore >= 80 ?'A' :
          averageScore >= 70 ?'B+' :
            averageScore >= 60 ?'B' :
              averageScore >= 50 ?'C' :'D';

      const daysSinceActivity = Math.floor(
        (new Date().getTime() - new Date(student.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );

      const status = daysSinceActivity <= 7 ?'Active' :
        daysSinceActivity <= 30 ?'Moderate' :'Inactive';

      return {
        id: index + 1, // For DataGrid
        studentId: student.id,
        name: student.name,
        email: student.email,
        grade: grade,
        averageScore: averageScore,
        totalExams: student.totalExams,
        attendance: Math.min(100, (student.totalExams * 10)), // Simplified attendance calculation
        status: status,
        lastActivity: student.lastActivity
      };
    });

    return studentsArray;

  } catch (error) {
    console.error('Error getting detailed students data:', error);
    return [];
  }
}

//  Get Teacher Recent Activity
async function getTeacherRecentActivity(teacherId, limit = 10) {
  try {
    const activities = [];

    // Get recent courses created
    const recentCourses = await Course.find({
      teacher_id: new mongoose.Types.ObjectId(teacherId)
    })
      .sort({ createdAt: -1 })
      .limit(3);

    recentCourses.forEach(course => {
      activities.push({
        id: course._id.toString(),
        type:'course',
        title: `Created course"${course.title}"`,
        description: course.short_desc ||'New course published',
        timestamp: getRelativeTime(course.createdAt),
        icon:'',
        color:'#1890ff'
      });
    });

    // Get recent exams created
    const recentExams = await Exam.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    })
      .sort({ createdAt: -1 })
      .limit(3);

    recentExams.forEach(exam => {
      activities.push({
        id: exam._id.toString(),
        type:'exam',
        title: `Created exam"${exam.title}"`,
        description: `${exam.questions.length} questions, ${exam.durationMinutes} minutes`,
        timestamp: getRelativeTime(exam.createdAt),
        icon:'',
        color:'#52c41a'
      });
    });

    // Get recent submissions to teacher's exams
    const teacherExams = await Exam.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    }).select('_id title');

    const recentSubmissions = await Submission.find({
      examId: { $in: teacherExams.map(e => e._id) }
    })
      .populate('studentId','name')
      .populate('examId','title')
      .sort({ submittedAt: -1 })
      .limit(5);

    recentSubmissions.forEach(submission => {
      if (submission.studentId && submission.examId) {
        activities.push({
          id: submission._id.toString(),
          type:'submission',
          title: `${submission.studentId.name} completed"${submission.examId.title}"`,
          description: `Score: ${submission.score?.percentage || 0}% (${submission.score?.grade ||'N/A'})`,
          timestamp: getRelativeTime(submission.submittedAt),
          icon:'',
          color:'#faad14'
        });
      }
    });

    // Sort by timestamp and return limited results
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting teacher recent activity:', error);
    return [];
  }
}

//  Utility function for relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return new Date(date).toLocaleDateString();
}

module.exports = exports;
