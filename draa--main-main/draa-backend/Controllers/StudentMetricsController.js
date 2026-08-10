const mongoose = require('mongoose');
const StudentMetrics = require('../Models/StudentMetricsModel');
const User = require('../Models/UserModel');

// Get or create student metrics
exports.getMetrics = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    let metrics = await StudentMetrics.getOrCreate(studentId);

    // Live-rank: count how many students have more points than this user.
    // Persisted so the front-end doesn't need a separate round-trip, and the
    // leaderboard page can refresh it whenever it's loaded.
    try {
      const hiddenUsers = await User.find({ 'settings.privacy.showRanking': false }).select('_id');
      const hiddenIds = hiddenUsers.map((u) => u._id);
      const higherRanked = await StudentMetrics.countDocuments({
        studentId: { $nin: hiddenIds },
        'achievements.totalPoints': { $gt: metrics.achievements.totalPoints || 0 },
      });
      const totalStudents = await StudentMetrics.countDocuments({
        studentId: { $nin: hiddenIds },
      });
      metrics.achievements.rank = higherRanked + 1;
      metrics.achievements.totalStudents = totalStudents;
      metrics.achievements.percentile = totalStudents > 0
        ? Math.round(((totalStudents - metrics.achievements.rank) / totalStudents) * 100)
        : 0;
      await metrics.save();
    } catch (rankErr) {
      console.error(' Failed to compute live rank in getMetrics:', rankErr.message);
    }

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load student metrics',
      error: error.message
    });
  }
};

// Get detailed analytics
exports.getDetailedAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.getOrCreate(studentId);

    // Calculate additional analytics
    const analytics = {
      overallPerformance: metrics.overallPerformance,
      academicSummary: {
        averageScore: metrics.academic.averageScore,
        passRate: metrics.academic.passRate,
        totalExams: metrics.academic.totalExamsTaken,
        improvementRate: metrics.academic.improvementRate,
        gradeDistribution: metrics.academic.gradeDistribution
      },
      courseSummary: {
        total: metrics.courses.totalEnrolled,
        completed: metrics.courses.completed,
        inProgress: metrics.courses.inProgress,
        completionRate: metrics.courses.completionRate,
        averageProgress: metrics.courses.averageProgress
      },
      testSeriesSummary: {
        total: metrics.testSeries.totalPurchased,
        attempted: metrics.testSeries.attempted,
        completed: metrics.testSeries.completed,
        completionRate: metrics.testSeries.completionRate || 0,
        averageScore: metrics.testSeries.averageScore,
        highestScore: metrics.testSeries.highestScore || 0,
        accuracyRate: metrics.testSeries.accuracyRate
      },
      booksSummary: {
        total: metrics.books.totalPurchased,
        read: metrics.books.readBooks,
        readingProgress: metrics.books.readingProgress
      },
      achievementsSummary: {
        totalPoints: metrics.achievements.totalPoints,
        rank: metrics.achievements.rank,
        level: metrics.achievements.level,
        streak: metrics.achievements.streak,
        certificates: metrics.achievements.certificates,
        badges: metrics.achievements.badges
      },
      activitySummary: {
        last7Days: metrics.activity.activitiesLast7Days,
        last30Days: metrics.activity.activitiesLast30Days,
        trend: metrics.activity.weeklyTrend,
        preferredTime: metrics.activity.preferredStudyTime
      },
      strengthsAndWeaknesses: {
        strongSubjects: metrics.analytics.strongSubjects,
        weakSubjects: metrics.analytics.weakSubjects,
        recommendedFocus: metrics.analytics.recommendedFocus,
        learningStyle: metrics.analytics.learningStyle
      },
      recentActivity: metrics.recentActivity.slice(0, 10),
      upcomingDeadlines: metrics.deadlines.filter(d => !d.completed).slice(0, 5),
      monthlyProgress: metrics.monthlyProgress
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting detailed analytics:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load detailed analytics',
      error: error.message
    });
  }
};

// Refresh all metrics
exports.refreshMetrics = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    console.log('Refreshing metrics for student:', studentId);

    const metrics = await StudentMetrics.refreshAll(studentId);

    res.json({
      success: true,
      message:'Metrics refreshed successfully',
      data: metrics
    });

  } catch (error) {
    console.error('Error refreshing metrics:', error);
    res.status(500).json({
      success: false,
      message:'Failed to refresh metrics',
      error: error.message
    });
  }
};

// Update specific metric section
exports.updateMetricsSection = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { section, data } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const validSections = ['courses','books','testSeries','achievements','activity','goals','customMetrics'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${validSections.join(',')}`
      });
    }

    const metrics = await StudentMetrics.findOneAndUpdate(
      { studentId },
      { [section]: data,'metadata.lastUpdated': new Date() },
      { new: true, runValidators: true }
    );

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    res.json({
      success: true,
      message:'Metrics section updated',
      data: metrics
    });

  } catch (error) {
    console.error('Error updating metrics section:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update metrics section',
      error: error.message
    });
  }
};

// Add activity to metrics
exports.addActivity = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type, title, description, icon, color, score, progress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    metrics.addActivity({
      type,
      title,
      description,
      icon,
      color,
      score,
      progress
    });

    await metrics.save();

    res.json({
      success: true,
      message:'Activity added',
      recentActivity: metrics.recentActivity.slice(0, 5)
    });

  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      message:'Failed to add activity',
      error: error.message
    });
  }
};

// Get performance trends
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

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    const trends = {
      monthlyProgress: metrics.monthlyProgress.slice(-6),
      performanceHistory: metrics.analytics.performanceHistory.slice(-6),
      streakHistory: {
        current: metrics.achievements.streak.current,
        longest: metrics.achievements.streak.longest,
        lastActive: metrics.achievements.streak.lastActiveDate
      },
      activityTrend: metrics.activity.weeklyTrend,
      studyHours: {
        thisWeek: metrics.academic.studyHoursThisWeek,
        thisMonth: metrics.academic.studyHoursThisMonth
      }
    };

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Error getting performance trends:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load performance trends',
      error: error.message
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit ='10' } = req.query;

    // Filter out students who have disabled showRanking in settings
    const hiddenUsers = await User.find({
      'settings.privacy.showRanking': false
    }).select('_id');
    const hiddenUserIds = hiddenUsers.map(u => u._id);

    const topStudents = await StudentMetrics.find({
      studentId: { $nin: hiddenUserIds }
    })
      .sort({'achievements.totalPoints': -1 })
      .limit(parseInt(limit))
      .populate('studentId','name avatar email');

    const leaderboard = topStudents.map((metrics, index) => ({
      rank: index + 1,
      studentId: metrics.studentId?._id,
      name: metrics.studentId?.name,
      avatar: metrics.studentId?.avatar,
      points: metrics.achievements.totalPoints,
      streak: metrics.achievements.streak.current,
      level: metrics.achievements.level
    }));

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load leaderboard',
      error: error.message
    });
  }
};

// Get student rank
exports.getStudentRank = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    // Filter out students who have disabled showRanking in settings
    const hiddenUsers = await User.find({
      'settings.privacy.showRanking': false
    }).select('_id');
    const hiddenUserIds = hiddenUsers.map(u => u._id);

    // Count students with higher points who are not hidden
    const higherRanked = await StudentMetrics.countDocuments({
      studentId: { $nin: hiddenUserIds },
      'achievements.totalPoints': { $gt: metrics.achievements.totalPoints }
    });

    const rank = higherRanked + 1;

    // Update rank in metrics
    metrics.achievements.rank = rank;
    await metrics.save();

    // Get total students excluding hidden
    const totalStudents = await StudentMetrics.countDocuments({
      studentId: { $nin: hiddenUserIds }
    });

    res.json({
      success: true,
      data: {
        rank,
        totalStudents,
        percentile: Math.round(((totalStudents - rank) / totalStudents) * 100),
        points: metrics.achievements.totalPoints,
        level: metrics.achievements.level
      }
    });

  } catch (error) {
    console.error('Error getting student rank:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load student rank',
      error: error.message
    });
  }
};

// Get achievements and badges
exports.getAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    const achievements = {
      points: metrics.achievements.totalPoints,
      level: metrics.achievements.level,
      rank: metrics.achievements.rank,
      certificates: metrics.achievements.certificates,
      badges: metrics.achievements.badges,
      recentBadges: metrics.achievements.recentBadges,
      streak: metrics.achievements.streak,
      milestones: metrics.achievements.milestones,
      nextLevelProgress: (metrics.achievements.totalPoints % 100) // Assuming 100 points per level
    };

    res.json({
      success: true,
      data: achievements
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load achievements',
      error: error.message
    });
  }
};

// Get study insights
exports.getStudyInsights = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    const insights = {
      learningStyle: metrics.analytics.learningStyle,
      strongSubjects: metrics.analytics.strongSubjects,
      weakSubjects: metrics.analytics.weakSubjects,
      recommendedFocus: metrics.analytics.recommendedFocus,
      strengths: metrics.analytics.strengths,
      areasForImprovement: metrics.analytics.areasForImprovement,
      preferredStudyTime: metrics.activity.preferredStudyTime,
      averageSessionDuration: metrics.activity.averageSessionDuration,
      goals: metrics.goals,
      goalsProgress: {
        dailyStudy: metrics.activity.activitiesLast7Days / 7 / metrics.goals.dailyStudyGoal,
        weeklyExams: metrics.activity.sessionsThisWeek / metrics.goals.weeklyExamGoal,
        streak: metrics.achievements.streak.current / metrics.goals.currentStreakGoal
      }
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error getting study insights:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load study insights',
      error: error.message
    });
  }
};

// Get real-time dashboard data (lightweight)
exports.getDashboardData = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid student ID format"
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId })
      .select('academic courses testSeries books achievements activity deadlines recentActivity');

    if (!metrics) {
      // Return default data
      return res.json({
        success: true,
        data: {
          academic: { averageScore: 0, passRate: 0, totalExamsTaken: 0, gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 } },
          courses: { totalEnrolled: 0, completed: 0, completionRate: 0 },
          testSeries: { totalPurchased: 0, averageScore: 0 },
          books: { totalPurchased: 0, readBooks: 0 },
          achievements: { totalPoints: 0, level: 1, streak: { current: 0, longest: 0 } },
          activity: { activitiesLast30Days: 0, weeklyTrend:'stable' },
          deadlines: [],
          recentActivity: []
        }
      });
    }

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message:'Failed to load dashboard data',
      error: error.message
    });
  }
};
