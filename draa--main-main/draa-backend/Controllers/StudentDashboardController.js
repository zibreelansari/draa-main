const mongoose = require('mongoose');

// Import your existing models
const Course = require('../Models/CourseModel');
const Book = require('../Models/booksModel');
const TestSeries = require('../Models/TestSeriesModels');
const Exam = require('../Models/ExamModel');
const Submission = require('../Models/exam.submission.models');
const Purchase = require('../Models/purchaseModels');
const User = require('../Models/UserModel');
const Wishlist = require('../Models/WishLists.models');
const TestAttempt = require('../Models/TestSeriesAttempt');
const CoinTransaction = require('../Models/CoinTransaction');
const CourseContent = require('../Models/CourseConjtent');
const CourseProgress = require('../Models/CourseProgressModels');

const dashboardPromises = new Map();
const DASHBOARD_CACHE_TTL = 15000; // 15 seconds

//  Main Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const now = Date.now();
    let cached = dashboardPromises.get(studentId);

    if (!cached || (now - cached.timestamp > DASHBOARD_CACHE_TTL)) {
      const compilePromise = (async () => {
        console.log(' Loading dashboard stats for student:', studentId);
        // Run all statistics queries in parallel
        const learningStreak = await getLearningStreak(studentId);

        const [
          courseStats,
          bookStats,
          testSeriesStats,
          examStats,
          achievementStats,
          performanceMetrics,
          recentActivity,
          upcomingDeadlines,
          monthlyProgress
        ] = await Promise.all([
          getCourseStatistics(studentId),
          getBookStatistics(studentId),
          getTestSeriesStatistics(studentId),
          getExamStatistics(studentId),
          getAchievementStatistics(studentId, learningStreak),
          getPerformanceMetrics(studentId),
          getRecentActivityData(studentId, 10),
          getUpcomingDeadlinesData(studentId, 5),
          getMonthlyProgress(studentId)
        ]);

        return {
          courses: courseStats,
          books: bookStats,
          testSeries: testSeriesStats,
          exams: examStats,
          achievements: achievementStats,
          performance: performanceMetrics,
          learningStreak: learningStreak,
          monthlyProgress: monthlyProgress,
          recentActivity: recentActivity,
          upcomingDeadlines: upcomingDeadlines,
          notifications: recentActivity.length + upcomingDeadlines.length,
          lastUpdated: new Date()
        };
      })();

      cached = { promise: compilePromise, timestamp: now };
      dashboardPromises.set(studentId, cached);
    }

    const dashboardData = await cached.promise;

    console.log(' Dashboard stats compiled');

    res.json({
      success: true,
      data: dashboardData,
      studentId: studentId
    });

  } catch (error) {
    console.error(' Error loading dashboard stats:', error);
    if (req.params.studentId) {
      dashboardPromises.delete(req.params.studentId);
    }
    res.status(500).json({
      success: false,
      message:'Failed to load dashboard statistics',
      error: error.message
    });
  }
};

//  FIXED: Export Recent Activity as route handler
exports.getRecentActivity = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit ='10' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const activities = await getRecentActivityData(studentId, parseInt(limit));

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });

  } catch (error) {
    console.error(' Error loading recent activity:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load recent activity',
      error: error.message
    });
  }
};

//  FIXED: Export Upcoming Deadlines as route handler
exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit ='5' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const deadlines = await getUpcomingDeadlinesData(studentId, parseInt(limit));

    res.json({
      success: true,
      data: deadlines,
      count: deadlines.length
    });

  } catch (error) {
    console.error(' Error loading upcoming deadlines:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load upcoming deadlines',
      error: error.message
    });
  }
};

//  NEW: Performance Trends
exports.getPerformanceTrends = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period ='30' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const trends = await getPerformanceTrendsData(studentId, parseInt(period));

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error(' Error loading performance trends:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load performance trends',
      error: error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS (Not exported as routes)
// ============================================

//  Course Statistics
async function getCourseStatistics(studentId) {
  try {
    const purchasedCourses = await Purchase.find({
      customer_id: new mongoose.Types.ObjectId(studentId),
      purchase_type:'course',
      status:'completed'
    }).populate('item_id');

    const totalCourses = purchasedCourses.length;
    let completedCourses = 0;
    let activeCourses = 0;
    let notStarted = 0;
    let totalHours = 0;
    let totalProgress = 0;
    let categoriesEnrolled = new Set();

    const progressRecords = await CourseProgress.find({
      student_id: studentId
    }).lean();

    const progressMap = progressRecords.reduce((acc, curr) => {
      acc[curr.course_id.toString()] = curr.overall_progress.completion_percentage;
      return acc;
    }, {});

    for (const purchase of purchasedCourses) {
      const courseData = purchase.item_id;
      if (courseData) {
        totalHours += courseData.duration || 0;
        const progress = progressMap[courseData._id.toString()] || 0;
        totalProgress += progress;

        if (courseData.category) {
          categoriesEnrolled.add(courseData.category);
        }

        if (progress >= 100) {
          completedCourses++;
        } else if (progress > 0) {
          activeCourses++;
        } else {
          notStarted++;
        }
      }
    }

    const completionRate = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    const averageTimePerCourse = totalCourses > 0 ? Math.round(totalHours / totalCourses) : 0;

    return {
      total: totalCourses,
      active: activeCourses,
      completed: completedCourses,
      notStarted: notStarted,
      totalHours: Math.round(totalHours),
      averageTimePerCourse: averageTimePerCourse,
      completionRate: completionRate,
      categoriesCount: categoriesEnrolled.size,
      categories: Array.from(categoriesEnrolled)
    };

  } catch (error) {
    console.error('Error getting course statistics:', error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      notStarted: 0,
      totalHours: 0,
      averageTimePerCourse: 0,
      completionRate: 0,
      categoriesCount: 0,
      categories: []
    };
  }
}

//  Book Statistics
async function getBookStatistics(studentId) {
  try {
    const purchasedBooks = await Purchase.find({
      customer_id: new mongoose.Types.ObjectId(studentId),
      purchase_type: { $in: ['book','ebook','Ebook','Book'] },
      status:'completed'
    }).populate('item_id');

    const totalBooks = purchasedBooks.length;
    let pdfBooks = 0;
    let physicalBooks = 0;
    let totalSpent = 0;
    let readBooks = 0;
    let categoriesMap = {};

    for (const purchase of purchasedBooks) {
      const bookData = purchase.item_id;
      if (bookData) {
        if (bookData.type ==='pdf' || bookData.format ==='digital') {
          pdfBooks++;
        } else {
          physicalBooks++;
        }

        if (purchase.isRead || purchase.progress >= 100) {
          readBooks++;
        }

        if (bookData.category) {
          categoriesMap[bookData.category] = (categoriesMap[bookData.category] || 0) + 1;
        }
      }
    }

    const readingCompletionRate = totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0;

    return {
      total: totalBooks,
      pdfBooks: pdfBooks,
      physicalBooks: physicalBooks,
      readBooks: readBooks,
      unreadBooks: totalBooks - readBooks,
      totalSpent: Math.round(totalSpent),
      averageBookCost: totalBooks > 0 ? Math.round(totalSpent / totalBooks) : 0,
      readingCompletionRate: readingCompletionRate,
      categoriesBreakdown: categoriesMap
    };

  } catch (error) {
    console.error('Error getting book statistics:', error);
    return {
      total: 0,
      pdfBooks: 0,
      physicalBooks: 0,
      readBooks: 0,
      unreadBooks: 0,
      totalSpent: 0,
      averageBookCost: 0,
      readingCompletionRate: 0,
      categoriesBreakdown: {}
    };
  }
}

//  Test Series Statistics
async function getTestSeriesStatistics(studentId) {
  try {
    const purchasedTestSeries = await Purchase.find({
      customer_id: new mongoose.Types.ObjectId(studentId),
      purchase_type: { $in: ['test_series','TestSeries'] },
      status:'completed'
    }).populate('item_id');

    const totalTestSeries = purchasedTestSeries.length;
    let completedTestSeries = 0;
    let activeTestSeries = 0;
    let notStarted = 0;
    let totalScore = 0;
    let attemptedCount = 0;
    let highestScore = 0;
    let lowestScore = 100;

    for (const purchase of purchasedTestSeries) {
      if (purchase.item_id) {
        const progress = purchase.progress || 0;

        if (progress >= 100) {
          completedTestSeries++;
        } else if (progress > 0) {
          activeTestSeries++;
        } else {
          notStarted++;
        }

        if (purchase.lastScore !== undefined && purchase.lastScore !== null) {
          const score = purchase.lastScore;
          totalScore += score;
          attemptedCount++;

          if (score > highestScore) highestScore = score;
          if (score < lowestScore) lowestScore = score;
        }
      }
    }

    const averageScore = attemptedCount > 0 ? Math.round(totalScore / attemptedCount) : 0;

    return {
      total: totalTestSeries,
      completed: completedTestSeries,
      active: activeTestSeries,
      notStarted: notStarted,
      averageScore: averageScore,
      highestScore: attemptedCount > 0 ? highestScore : 0,
      lowestScore: attemptedCount > 0 ? lowestScore : 0,
      attempted: attemptedCount
    };

  } catch (error) {
    console.error('Error getting test series statistics:', error);
    return {
      total: 0,
      completed: 0,
      active: 0,
      notStarted: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      attempted: 0
    };
  }
}

//  Exam Statistics
async function getExamStatistics(studentId) {
  try {
    const submissions = await Submission.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    }).populate('examId').sort({ submittedAt: -1 });

    const totalExams = submissions.length;
    const completedExams = submissions.filter(s => s.status ==='submitted').length;

    const availableExams = await Exam.find({
      status:'active',
      $or: [
        { scheduledAt: { $exists: false } },
        { scheduledAt: { $lte: new Date() } }
      ]
    });

    const pendingExams = Math.max(0, availableExams.length - totalExams);

    let totalScore = 0;
    let scoredExams = 0;
    let passedExams = 0;
    let failedExams = 0;
    let grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    submissions.forEach(submission => {
      if (submission.score && submission.score.percentage !== undefined) {
        const percentage = submission.score.percentage;
        totalScore += percentage;
        scoredExams++;

        if (percentage >= 40) passedExams++;
        else failedExams++;

        if (submission.score.grade && grades.hasOwnProperty(submission.score.grade)) {
          grades[submission.score.grade]++;
        }
      }
    });

    const averageScore = scoredExams > 0 ? Math.round(totalScore / scoredExams) : 0;
    const passRate = scoredExams > 0 ? Math.round((passedExams / scoredExams) * 100) : 0;

    return {
      total: totalExams,
      completed: completedExams,
      pending: pendingExams,
      averageScore: averageScore,
      passedExams: passedExams,
      failedExams: failedExams,
      passRate: passRate,
      gradesDistribution: grades
    };

  } catch (error) {
    console.error('Error getting exam statistics:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      averageScore: 0,
      passedExams: 0,
      failedExams: 0,
      passRate: 0,
      gradesDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
    };
  }
}

//  Achievement Statistics
async function getAchievementStatistics(studentId, streak) {
  try {
    const sId = new mongoose.Types.ObjectId(studentId);
    const [completedCourses, highScoreExams, totalSubmissions, totalPurchases] = await Promise.all([
      Purchase.countDocuments({
        customer_id: sId,
        purchase_type:'course',
        status:'completed',
        progress: { $gte: 100 }
      }),
      Submission.countDocuments({
        studentId: sId,
        'score.percentage': { $gte: 80 }
      }),
      Submission.countDocuments({
        studentId: sId
      }),
      Purchase.countDocuments({
        customer_id: sId,
        status:'completed'
      })
    ]);

    const certificates = completedCourses + Math.floor(highScoreExams / 5);

    const badges = {
      learner: totalPurchases >= 3 ? 1 : 0,
      expert: completedCourses >= 5 ? 1 : 0,
      achiever: highScoreExams >= 10 ? 1 : 0,
      dedicated: totalSubmissions >= 20 ? 1 : 0
    };

    const totalBadges = Object.values(badges).reduce((a, b) => a + b, 0);

    const totalAchievements = completedCourses * 10 + highScoreExams * 5 + certificates * 15;
    const rank = Math.max(1, 1000 - totalAchievements);

    return {
      certificates: certificates,
      badges: totalBadges,
      badgesBreakdown: badges,
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      rank: rank,
      totalPoints: totalAchievements
    };

  } catch (error) {
    console.error('Error getting achievement statistics:', error);
    return {
      certificates: 0,
      badges: 0,
      badgesBreakdown: { learner: 0, expert: 0, achiever: 0, dedicated: 0 },
      streak: 0,
      longestStreak: 0,
      rank: 999,
      totalPoints: 0
    };
  }
}

//  Performance Metrics
async function getPerformanceMetrics(studentId) {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [activitiesLast30Days, activitiesLast7Days, recentSubmissions] = await Promise.all([
      Purchase.countDocuments({
        customer_id: new mongoose.Types.ObjectId(studentId),
        status:'completed',
        createdAt: { $gte: last30Days }
      }),
      Purchase.countDocuments({
        customer_id: new mongoose.Types.ObjectId(studentId),
        status:'completed',
        createdAt: { $gte: last7Days }
      }),
      Submission.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        submittedAt: { $gte: last30Days }
      }).sort({ submittedAt: -1 })
    ]);

    let scoresTrend = [];
    for (const submission of recentSubmissions) {
      if (submission.score && submission.score.percentage) {
        scoresTrend.push(submission.score.percentage);
      }
    }

    const averageRecentScore = scoresTrend.length > 0
      ? Math.round(scoresTrend.reduce((a, b) => a + b, 0) / scoresTrend.length)
      : 0;

    return {
      activitiesLast30Days: activitiesLast30Days,
      activitiesLast7Days: activitiesLast7Days,
      weeklyActivityTrend: activitiesLast7Days > 0 ?'increasing' :'stable',
      averageRecentScore: averageRecentScore,
      performanceTrend: scoresTrend.length >= 2 && scoresTrend[0] > scoresTrend[scoresTrend.length - 1] ?'improving' :'stable',
      totalAssessments: recentSubmissions.length
    };

  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      activitiesLast30Days: 0,
      activitiesLast7Days: 0,
      weeklyActivityTrend:'stable',
      averageRecentScore: 0,
      performanceTrend:'stable',
      totalAssessments: 0
    };
  }
}

//  Learning Streak
// Counts consecutive calendar days the student performed any learning activity:
//   - completed/submitted test attempts
//   - exam submissions
//   - course progress updates
async function getLearningStreak(studentId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return { currentStreak: 0, longestStreak: 0, lastActivity: null };
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const [attempts, examSubs, courseProgress] = await Promise.all([
      TestAttempt.find({ user: studentObjectId, status: { $in: ['completed', 'submitted'] } })
        .select('startTime')
        .lean(),
      Submission.find({ studentId: studentObjectId }).select('submittedAt').lean(),
      CourseProgress.find({ user: studentObjectId }).select('updatedAt createdAt').lean(),
    ]);

    const activityTimestamps = [
      ...attempts.map((a) => a.startTime).filter(Boolean),
      ...examSubs.map((s) => s.submittedAt).filter(Boolean),
      ...courseProgress.flatMap((c) => [c.updatedAt, c.createdAt]).filter(Boolean),
    ].map((d) => new Date(d));

    if (activityTimestamps.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActivity: null };
    }

    // Normalize to date-only strings (YYYY-MM-DD in local time) so two events on
    // the same calendar day collapse into one slot regardless of clock skew.
    const dayKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };

    const uniqueDayKeys = [...new Set(activityTimestamps.map(dayKey))].sort((a, b) => (a < b ? 1 : -1));

    const toDate = (key) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastActivity = activityTimestamps.reduce((max, d) => (d > max ? d : max), activityTimestamps[0]);

    // Walk through the most-recent first; track the running chain anchored to today.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current streak: only counts days that are today or yesterday — older chains
    // are still remembered as "longestStreak" but the user doesn't see a stale live streak.
    let currentStreak = 0;
    let expected = new Date(today);
    for (const key of uniqueDayKeys) {
      const d = toDate(key);
      const diff = Math.round((expected - d) / oneDayMs);
      if (diff === 0) {
        currentStreak += 1;
        expected = new Date(expected.getTime() - oneDayMs);
      } else if (diff === 1 && currentStreak === 0) {
        // Allow yesterday as the anchor for "today I haven't studied yet but I'm still on a streak".
        currentStreak = 1;
        expected = new Date(d.getTime() - oneDayMs);
      } else {
        break;
      }
    }

    // Longest streak: scan all unique days for the longest consecutive chain.
    let longestStreak = 0;
    let running = 0;
    const ascending = [...uniqueDayKeys].sort(); // oldest -> newest
    let prevDate = null;
    for (const key of ascending) {
      const d = toDate(key);
      if (prevDate) {
        const diff = Math.round((d - prevDate) / oneDayMs);
        if (diff === 1) {
          running += 1;
        } else if (diff > 1) {
          running = 1;
        }
        // diff === 0 means duplicate day (shouldn't happen after Set dedup, but guard anyway).
      } else {
        running = 1;
      }
      if (running > longestStreak) longestStreak = running;
      prevDate = d;
    }

    return {
      currentStreak,
      longestStreak,
      lastActivity,
    };
  } catch (error) {
    console.error('Error calculating learning streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastActivity: null };
  }
}

//  Monthly Progress
async function getMonthlyProgress(studentId) {
  try {
    const sId = new mongoose.Types.ObjectId(studentId);
    const months = [];
    const now = new Date();
    const promises = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      promises.push(
        Purchase.countDocuments({
          customer_id: sId,
          purchase_type: 'course',
          status: 'completed',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        Submission.countDocuments({
          studentId: sId,
          submittedAt: { $gte: monthStart, $lte: monthEnd }
        })
      );
    }

    const counts = await Promise.all(promises);

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const index = (5 - i) * 2;
      const coursesEnrolled = counts[index];
      const examsCompleted = counts[index + 1];

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        coursesEnrolled: coursesEnrolled,
        examsCompleted: examsCompleted,
        totalActivity: coursesEnrolled + examsCompleted
      });
    }

    return months;

  } catch (error) {
    console.error('Error getting monthly progress:', error);
    return [];
  }
}

//  RENAMED: Recent Activity Data (helper function)
async function getRecentActivityData(studentId, limit = 10) {
  try {
    const sId = new mongoose.Types.ObjectId(studentId);
    const activities = [];

    const [
      courseActivities,
      bookActivities,
      examActivities,
      testAttempts,
      wishlistItems,
      blogActivities,
      rewardTransactions
    ] = await Promise.all([
      // 1. Course Purchases/Engagement
      Purchase.find({ customer_id: sId, purchase_type:'course', status:'completed' })
        .populate('item_id')
        .sort({ updatedAt: -1 })
        .limit(3),

      // 2. Book Purchases
      Purchase.find({ customer_id: sId, purchase_type: { $in: ['book','ebook','Ebook','Book'] }, status:'completed' })
        .populate('item_id')
        .sort({ createdAt: -1 })
        .limit(3),

      // 3. Exam Submissions
      Submission.find({ studentId: sId })
        .populate('examId')
        .sort({ submittedAt: -1 })
        .limit(3),

      // 4. Test Series Attempts (Detailed)
      TestAttempt.find({ user: sId })
        .populate('testSeries')
        .sort({ createdAt: -1 })
        .limit(5),

      // 5. Wishlist Additions
      Wishlist.find({ user_id: sId, isRemoved: false })
        .sort({ createdAt: -1 })
        .limit(3),

      // 6. Blog Submissions/Approvals
      CourseContent.find({ student: sId })
        .sort({ createdAt: -1 })
        .limit(3),

      // 7. Rewards & Coin Transactions
      CoinTransaction.find({ user: sId })
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    // Format Course Activities
    courseActivities.forEach(p => {
      if (p.item_id) {
        activities.push({
          id: p._id.toString(),
          type:'course',
          title: `${p.progress >= 100 ?'Completed' :'Learning'} ${p.item_id.title}`,
          description: p.item_id.short_desc ||'Course enrollment',
          timestamp: p.updatedAt || p.createdAt,
          relativeTime: getRelativeTime(p.updatedAt || p.createdAt),
          icon:'',
          color:'#6366f1',
          progress: p.progress || 0
        });
      }
    });

    // Format Book Activities
    bookActivities.forEach(p => {
      if (p.item_id) {
        activities.push({
          id: p._id.toString(),
          type:'book',
          title: `Library Update: ${p.item_id.title}`,
          description:'New book added to your digital collection',
          timestamp: p.createdAt,
          relativeTime: getRelativeTime(p.createdAt),
          icon:'',
          color:'#10b981'
        });
      }
    });

    // Format Exam Activities
    examActivities.forEach(s => {
      if (s.examId && s.score) {
        activities.push({
          id: s._id.toString(),
          type:'exam',
          title: `Exam Score: ${s.score.percentage}%`,
          description: `You completed the ${s.examId.title} module`,
          timestamp: s.submittedAt,
          relativeTime: getRelativeTime(s.submittedAt),
          icon: s.score.percentage >= 40 ?'' :'',
          color:'#f59e0b',
          score: s.score.percentage
        });
      }
    });

    // Format Test Series Attempts
    testAttempts.forEach(ta => {
      if (ta.testSeries) {
        activities.push({
          id: ta._id.toString(),
          type:'test_attempt',
          title: `Test Attempt: ${ta.percentage.toFixed(0)}%`,
          description: `Recent effort in ${ta.testSeries.title ||'Practice Test'}`,
          timestamp: ta.createdAt,
          relativeTime: getRelativeTime(ta.createdAt),
          icon:'',
          color:'#8b5cf6',
          score: ta.percentage
        });
      }
    });

    // Format Wishlist Items
    wishlistItems.forEach(wi => {
      activities.push({
        id: wi._id.toString(),
        type:'wishlist',
        title:'Saved for Later',
        description: `Added"${wi.snapshot?.title}" to your wishlist`,
        timestamp: wi.createdAt,
        relativeTime: getRelativeTime(wi.createdAt),
        icon:'',
        color:'#f43f5e'
      });
    });

    // Format Blog Activities
    blogActivities.forEach(b => {
      activities.push({
        id: b._id.toString(),
        type:'blog',
        title: b.approved ?'Blog Approved!' :'Blog Submitted',
        description: `Your piece"${b.content_subject}" ${b.approved ?'is now live' :'is awaiting review'}`,
        timestamp: b.updatedAt || b.createdAt,
        relativeTime: getRelativeTime(b.updatedAt || b.createdAt),
        icon: b.approved ?'' :'',
        color: b.approved ?'#10b981' :'#6366f1'
      });
    });

    // Format Reward Transactions
    rewardTransactions.forEach(rt => {
      activities.push({
        id: rt._id.toString(),
        type:'reward',
        title: `Reward ${rt.type ==='credit' ?'Earned' :'Spent'}`,
        description: `${rt.amount} Coins ${rt.type ==='credit' ?'credited' :'deducted'} - ${rt.description || rt.source}`,
        timestamp: rt.createdAt,
        relativeTime: getRelativeTime(rt.createdAt),
        icon:'',
        color:'#f59e0b'
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

//  RENAMED: Upcoming Deadlines Data (helper function)
async function getUpcomingDeadlinesData(studentId, limit = 5) {
  try {
    const deadlines = [];
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const upcomingExams = await Exam.find({
      status:'active',
      scheduledAt: {
        $gte: now,
        $lte: futureDate
      }
    }).sort({ scheduledAt: 1 }).limit(limit);

    upcomingExams.forEach(exam => {
      const daysUntil = Math.ceil((new Date(exam.scheduledAt) - now) / (24 * 60 * 60 * 1000));

      deadlines.push({
        id: exam._id.toString(),
        title: exam.title,
        type:'exam',
        dueDate: exam.scheduledAt,
        dueDateFormatted: new Date(exam.scheduledAt).toLocaleDateString('en-US', {
          weekday:'short',
          month:'short',
          day:'numeric',
          hour:'2-digit',
          minute:'2-digit'
        }),
        daysUntil: daysUntil,
        priority: daysUntil <= 2 ?'high' : daysUntil <= 7 ?'medium' :'low',
        completed: false
      });
    });

    return deadlines.slice(0, limit);

  } catch (error) {
    console.error('Error getting upcoming deadlines:', error);
    return [];
  }
}

//  Performance Trends Data
async function getPerformanceTrendsData(studentId, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const submissions = await Submission.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      submittedAt: { $gte: startDate }
    }).sort({ submittedAt: 1 });

    const trends = submissions.map(submission => ({
      date: new Date(submission.submittedAt).toLocaleDateString(),
      score: submission.score?.percentage || 0,
      examTitle: submission.examId?.title ||'Exam'
    }));

    return trends;

  } catch (error) {
    console.error('Error getting performance trends:', error);
    return [];
  }
}

//  Utility: Relative Time
function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;

  return new Date(date).toLocaleDateString();
}
