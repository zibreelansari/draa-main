const mongoose = require('mongoose');

const StudentMetricsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
    unique: true
  },

  // Academic Performance
  academic: {
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    totalExamsTaken: { type: Number, default: 0 },
    examsPassed: { type: Number, default: 0 },
    examsFailed: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    gradeDistribution: {
      A: { type: Number, default: 0 },
      B: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      D: { type: Number, default: 0 },
      F: { type: Number, default: 0 }
    },
    improvementRate: { type: Number, default: 0 }, // percentage improvement from last month
    studyHoursThisWeek: { type: Number, default: 0 },
    studyHoursThisMonth: { type: Number, default: 0 },
    averageTimePerExam: { type: Number, default: 0 }, // in minutes
    totalStudyTime: { type: Number, default: 0 } // in hours
  },

  // Course Progress
  courses: {
    totalEnrolled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    notStarted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 },
    totalHoursSpent: { type: Number, default: 0 },
    favoriteCategory: { type: String, default:'' },
    categoriesEnrolled: [{ type: String }]
  },

  // Test Series Progress
  testSeries: {
    totalPurchased: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 }, // percentage
    questionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 } // in minutes
  },

  // Book Reading Progress
  books: {
    totalPurchased: { type: Number, default: 0 },
    pdfBooks: { type: Number, default: 0 },
    physicalBooks: { type: Number, default: 0 },
    readBooks: { type: Number, default: 0 },
    readingProgress: { type: Number, default: 0 }, // percentage of total books
    totalPagesRead: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // in days
    currentBook: {
      title: { type: String, default:'' },
      progress: { type: Number, default: 0 },
      lastReadAt: { type: Date, default: null }
    }
  },

  // Achievement System
  achievements: {
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    certificates: { type: Number, default: 0 },
    badges: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null }
    },
    recentBadges: [{
      id: { type: String },
      name: { type: String },
      icon: { type: String },
      earnedAt: { type: Date }
    }],
    milestones: [{
      title: { type: String },
      achieved: { type: Boolean, default: false },
      achievedAt: { type: Date }
    }]
  },

  // Daily/Weekly Activity
  activity: {
    activitiesLast7Days: { type: Number, default: 0 },
    activitiesLast30Days: { type: Number, default: 0 },
    weeklyTrend: { type: String, enum: ['increasing','stable','decreasing'], default:'stable' },
    lastActiveAt: { type: Date, default: null },
    consecutiveDaysActive: { type: Number, default: 0 },
    preferredStudyTime: { type: String, default:'evening' }, // morning, afternoon, evening, night
    sessionsThisWeek: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 } // in minutes
  },

  // Performance Analytics
  analytics: {
    strongSubjects: [{ type: String }],
    weakSubjects: [{ type: String }],
    recommendedFocus: [{ type: String }],
    performanceHistory: [{
      month: { type: String },
      averageScore: { type: Number },
      examsTaken: { type: Number },
      improvement: { type: Number }
    }],
    learningStyle: { type: String, default:'visual' }, // visual, auditory, reading, kinesthetic
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }]
  },

  // Upcoming & Deadlines
  deadlines: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref:'exams' },
    title: { type: String },
    type: { type: String, enum: ['exam','assignment','test','course_deadline'] },
    dueDate: { type: Date },
    priority: { type: String, enum: ['high','medium','low'], default:'medium' },
    completed: { type: Boolean, default: false }
  }],

  // Recent Activity Log
  recentActivity: [{
    id: { type: String },
    type: { type: String, enum: ['course','book','exam','test_attempt','achievement','reward','blog'] },
    title: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    icon: { type: String },
    color: { type: String },
    score: { type: Number },
    progress: { type: Number }
  }],

  // Monthly Progress Summary
  monthlyProgress: [{
    month: { type: String }, //"Apr 2026"
    coursesEnrolled: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    examsCompleted: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    booksRead: { type: Number, default: 0 },
    totalActivities: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  }],

  // Goals & Targets
  goals: {
    dailyStudyGoal: { type: Number, default: 2 }, // hours
    weeklyExamGoal: { type: Number, default: 2 }, // exams per week
    monthlyCourseGoal: { type: Number, default: 1 }, // courses per month
    currentStreakGoal: { type: Number, default: 7 } // days
  },

  // Custom Metrics (for extensibility)
  customMetrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Metadata
  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    syncStatus: { type: String, enum: ['synced','pending','error'], default:'synced' }
  }

}, { timestamps: true });

// Index for faster queries
StudentMetricsSchema.index({ studentId: 1 });
StudentMetricsSchema.index({'achievements.totalPoints': -1 });
StudentMetricsSchema.index({'achievements.rank': 1 });
StudentMetricsSchema.index({'activity.lastActiveAt': -1 });

// Virtual for overall performance score
StudentMetricsSchema.virtual('overallPerformance').get(function () {
  const courseWeight = 0.25;
  const examWeight = 0.35;
  const testWeight = 0.2;
  const bookWeight = 0.1;
  const activityWeight = 0.1;

  const courseScore = this.courses.completionRate;
  const examScore = this.academic.passRate;
  const testScore = this.testSeries.averageScore;
  const bookScore = this.books.readingProgress;
  const activityScore = Math.min(100, (this.activity.activitiesLast30Days / 30) * 100);

  return Math.round(
    (courseScore * courseWeight) +
    (examScore * examWeight) +
    (testScore * testWeight) +
    (bookScore * bookWeight) +
    (activityScore * activityWeight)
  );
});

// Method to update streak
StudentMetricsSchema.methods.updateStreak = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = this.achievements.streak.lastActiveDate
    ? new Date(this.achievements.streak.lastActiveDate)
    : null;

  if (!lastActive) {
    this.achievements.streak.current = 1;
  } else {
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      this.achievements.streak.current += 1;
    } else {
      this.achievements.streak.current = 1;
    }
  }

  if (this.achievements.streak.current > this.achievements.streak.longest) {
    this.achievements.streak.longest = this.achievements.streak.current;
  }

  this.achievements.streak.lastActiveDate = now;
  this.activity.lastActiveAt = now;
};

// Method to add activity
StudentMetricsSchema.methods.addActivity = function (activity) {
  this.recentActivity.unshift({
    id: new mongoose.Types.ObjectId().toString(),
    ...activity,
    timestamp: new Date()
  });

  // Keep only last 50 activities
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }

  this.metadata.lastUpdated = new Date();
};

// Static method to get or create metrics
StudentMetricsSchema.statics.getOrCreate = async function (studentId) {
  let metrics = await this.findOne({ studentId });

  if (!metrics) {
    metrics = new this({
      studentId,
      achievements: {
        streak: { current: 0, longest: 0, lastActiveDate: null }
      },
      recentActivity: []
    });
    await metrics.save();
  }

  return metrics;
};

// Static method to refresh metrics for a student.
// Aggregates real activity from three independent signals:
//   - TestSeriesAttempt      (test series)
//   - Submission             (free-form exams)
//   - Purchase               (course enrollments, book purchases)
// Recomputes totalPoints using an industry-style weighted formula so the
// leaderboard ranks correlate with real engagement, not just one signal.
StudentMetricsSchema.statics.refreshAll = async function (studentId) {
  const mongoose = require('mongoose');
  const Purchase = require('./purchaseModels');
  const Submission = require('./exam.submission.models');
  const TestAttempt = require('./TestSeriesAttempt');
  const CourseProgress = require('./CourseProgressModels');

  const sId = new mongoose.Types.ObjectId(studentId);

  const metrics = (await this.findOne({ studentId: sId })) || new this({ studentId: sId });
  const prev = {
    avgScore: metrics.academic?.averageScore ?? 0,
    completedCourses: metrics.courses?.completed ?? 0,
  };

  // ---- 1. Pull raw signals in parallel ---------------------------------
  const [coursePurchases, courseProgressDocs, submissions, testAttempts, books] = await Promise.all([
    Purchase.find({ customer_id: sId, purchase_type:'course', status:'completed' }),
    CourseProgress.find({ student_id: sId }),
    Submission.find({ studentId: sId }),
    TestAttempt.find({ user: sId }),
    Purchase.find({
      customer_id: sId,
      purchase_type: { $in: ['book','ebook','Ebook','Book'] },
      status:'completed',
    }),
  ]);

  // ---- 2. Course stats -----------------------------------------------
  // Authoritative source is CourseProgress (one doc per course). When no
  // progress doc exists yet, fall back to the Purchase's progress field.
  const progressByCourse = new Map(
    courseProgressDocs.map((cp) => [String(cp.course_id), cp])
  );
  const courseRows = coursePurchases.map((p) => {
    const cp = progressByCourse.get(String(p._id || p.course_id || p.metadata?.courseId));
    const pct = cp?.overall_progress?.completion_percentage ?? p.progress ?? 0;
    const seconds = cp?.overall_progress?.total_time_spent ?? 0;
    return { purchase: p, percent: pct, seconds };
  });
  const completedCourses = courseRows.filter((r) => r.percent >= 100).length;
  const activeCourses = courseRows.filter((r) => r.percent > 0 && r.percent < 100).length;
  const totalCourseSeconds = courseRows.reduce((sum, r) => sum + r.seconds, 0);

  metrics.courses = {
    ...metrics.courses.toObject(),
    totalEnrolled: courseRows.length,
    completed: completedCourses,
    inProgress: activeCourses,
    notStarted: Math.max(0, courseRows.length - completedCourses - activeCourses),
    completionRate: courseRows.length > 0 ? Math.round((completedCourses / courseRows.length) * 100) : 0,
    averageProgress: courseRows.length > 0
      ? Math.round(courseRows.reduce((sum, r) => sum + r.percent, 0) / courseRows.length)
      : 0,
    totalHoursSpent: Math.round((totalCourseSeconds / 3600) * 10) / 10,
  };

  // ---- 3. Exam submission stats --------------------------------------
  const scoredExams = submissions.filter((s) => s.score?.percentage !== undefined);
  const examScores = scoredExams.map((s) => s.score.percentage || 0);
  const examsPassed = scoredExams.filter((s) => (s.score.percentage || 0) >= 40).length;
  const examMinutes = submissions.reduce((sum, s) => sum + ((s.timeTaken || 0) / 60), 0);

  const examAvg = examScores.length > 0
    ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length)
    : 0;
  const examHighest = examScores.length > 0 ? Math.max(...examScores) : 0;
  const examLowest = examScores.length > 0 ? Math.min(...examScores) : 0;

  // ---- 4. Test series stats -----------------------------------------
  const completedTests = testAttempts.filter((t) => (t.status ==='completed' || t.status ==='submitted'));
  const testScores = completedTests.map((t) => t.percentage || 0);
  const testAvg = testScores.length > 0
    ? Math.round(testScores.reduce((a, b) => a + b, 0) / testScores.length)
    : 0;
  const testHighest = testScores.length > 0 ? Math.max(...testScores) : 0;
  const testLowest = testScores.length > 0 ? Math.min(...testScores) : 0;
  const testsPassed = completedTests.filter((t) => (t.percentage || 0) >= 40).length;
  const testMinutes = completedTests.reduce((sum, t) => sum + ((t.timeSpent || 0) / 60), 0);
  const questionsAnswered = completedTests.reduce((sum, t) => sum + (t.totalQuestions || 0), 0);
  const correctAnswers = completedTests.reduce((sum, t) => sum + (t.correctAnswers || 0), 0);

  // ---- 5. Combined academic metrics (tests + exams) -----------------
  const combinedScores = [...examScores, ...testScores];
  const combinedAvg = combinedScores.length > 0
    ? Math.round(combinedScores.reduce((a, b) => a + b, 0) / combinedScores.length)
    : 0;
  const combinedHighest = combinedScores.length > 0 ? Math.max(...combinedScores) : 0;
  const combinedLowest = combinedScores.length > 0 ? Math.min(...combinedScores) : 0;
  const combinedAttempts = scoredExams.length + completedTests.length;
  const combinedPassed = examsPassed + testsPassed;

  // Improvement rate = how much the average has moved since last refresh.
  const improvementRate = prev.avgScore > 0
    ? Math.round(((combinedAvg - prev.avgScore) / prev.avgScore) * 100)
    : 0;

  // Grade distribution (counts of attempts landing in each band).
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  combinedScores.forEach((score) => {
    if (score >= 90) gradeDistribution.A += 1;
    else if (score >= 75) gradeDistribution.B += 1;
    else if (score >= 60) gradeDistribution.C += 1;
    else if (score >= 40) gradeDistribution.D += 1;
    else gradeDistribution.F += 1;
  });

  // Total learning time = course hours + exam minutes + test minutes.
  const courseHours = metrics.courses.totalHoursSpent || 0;
  const testHours = testMinutes / 60;
  const examHours = examMinutes / 60;
  const totalStudyHours = Math.round((courseHours + testHours + examHours) * 10) / 10;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTestMinutes = completedTests
    .filter((t) => t.endTime && new Date(t.endTime) >= oneWeekAgo)
    .reduce((sum, t) => sum + ((t.timeSpent || 0) / 60), 0);
  const recentExamMinutes = submissions
    .filter((s) => s.submittedAt && new Date(s.submittedAt) >= oneWeekAgo)
    .reduce((sum, s) => sum + ((s.timeTaken || 0) / 60), 0);
  const studyHoursThisWeek = Math.round((recentTestMinutes + recentExamMinutes) / 60 * 10) / 10;

  metrics.academic = {
    ...metrics.academic.toObject(),
    averageScore: combinedAvg,
    highestScore: combinedHighest,
    lowestScore: combinedLowest || 0,
    totalExamsTaken: combinedAttempts, // includes both test series and exam submissions
    examsPassed: combinedPassed,
    examsFailed: Math.max(0, combinedAttempts - combinedPassed),
    passRate: combinedAttempts > 0 ? Math.round((combinedPassed / combinedAttempts) * 100) : 0,
    gradeDistribution,
    improvementRate,
    studyHoursThisWeek,
    studyHoursThisMonth: totalStudyHours,
    averageTimePerExam: combinedAttempts > 0
      ? Math.round((testMinutes + examMinutes) / combinedAttempts)
      : 0,
    totalStudyTime: totalStudyHours,
  };

  metrics.testSeries = {
    ...metrics.testSeries.toObject(),
    totalPurchased: completedTests.length,
    attempted: completedTests.length,
    completed: testsPassed,
    completionRate: completedTests.length > 0
      ? Math.round((testsPassed / completedTests.length) * 100)
      : 0,
    averageScore: testAvg,
    highestScore: testHighest,
    lowestScore: testLowest || 0,
    accuracyRate: testAvg,
    questionsAnswered,
    correctAnswers,
    totalTimeSpent: Math.round(testMinutes),
  };

  // ---- 6. Book stats (unchanged behaviour) ---------------------------
  const readBooks = books.filter((b) => b.metadata?.isRead === true || (b.progress || 0) >= 100).length;
  metrics.books = {
    ...metrics.books.toObject(),
    totalPurchased: books.length,
    pdfBooks: books.filter((b) => (b.purchase_type || '').toLowerCase().includes('ebook')).length,
    physicalBooks: books.filter((b) => (b.purchase_type || '').toLowerCase() ==='book').length,
    readBooks,
    readingProgress: books.length > 0 ? Math.round((readBooks / books.length) * 100) : 0,
  };

  // ---- 7. Streak (already covers activity via updateStreak) ----------
  metrics.updateStreak();

  // ---- 8. Total points (industry-style weighted formula) -----------
  //   - Each test attempt:        10 base points + accuracy bonus (capped at 60)
  //   - Each test pass (≥40%):    +15 bonus
  //   - Each exam submission:     12 base + accuracy bonus (capped at 70)
  //   - Each exam pass (≥40%):    +20 bonus
  //   - Each course completion:   +120 (large weight, mirrors Oliveboard/Unacademy)
  //   - Each streak day:          +2 (multiplied by current streak)
  //   - Each book read:           +30
  let points = 0;
  completedTests.forEach((t) => {
    const score = t.percentage || 0;
    points += 10 + Math.min(60, Math.round(score * 0.6));
    if (score >= 40) points += 15;
  });
  scoredExams.forEach((s) => {
    const score = s.score.percentage || 0;
    points += 12 + Math.min(70, Math.round(score * 0.7));
    if (score >= 40) points += 20;
  });
  points += completedCourses * 120;
  points += readBooks * 30;
  points += (metrics.achievements.streak.current || 0) * 2;
  metrics.achievements.totalPoints = points;

  // Level scales with points: every 500 points = +1 level.
  metrics.achievements.level = Math.max(1, Math.floor(points / 500) + 1);
  // Rank is recalculated by StudentLeaderboardController.getStudentRank, so
  // we only zero out here; the controller will fill it in on next fetch.

  // ---- 9. Monthly progress -------------------------------------------
  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month:'short', year:'numeric' });
  const existingMonth = metrics.monthlyProgress.find((m) => m.month === currentMonth);

  // Trend baseline: prior month's avg score.
  const sortedMonths = [...metrics.monthlyProgress].sort((a, b) => (a.month < b.month ? -1 : 1));
  const priorMonthAvg = sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1].averageScore || 0 : 0;

  if (existingMonth) {
    existingMonth.coursesEnrolled = metrics.courses.totalEnrolled;
    existingMonth.examsCompleted = metrics.academic.totalExamsTaken;
    existingMonth.totalActivities =
      metrics.courses.totalEnrolled + metrics.academic.totalExamsTaken;
    existingMonth.averageScore = metrics.academic.averageScore;
  } else {
    metrics.monthlyProgress.push({
      month: currentMonth,
      coursesEnrolled: metrics.courses.totalEnrolled,
      examsCompleted: metrics.academic.totalExamsTaken,
      totalActivities: metrics.courses.totalEnrolled + metrics.academic.totalExamsTaken,
      averageScore: metrics.academic.averageScore,
    });
    if (metrics.monthlyProgress.length > 6) {
      metrics.monthlyProgress = metrics.monthlyProgress.slice(-6);
    }
  }

  // Activity trend (weekly).
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekMinutes = (recentTestMinutes + recentExamMinutes);
  const prevWeekMinutes =
    completedTests
      .filter((t) => t.endTime && new Date(t.endTime) >= twoWeeksAgo && new Date(t.endTime) < oneWeekAgo)
      .reduce((sum, t) => sum + ((t.timeSpent || 0) / 60), 0) +
    submissions
      .filter((s) => s.submittedAt && new Date(s.submittedAt) >= twoWeeksAgo && new Date(s.submittedAt) < oneWeekAgo)
      .reduce((sum, s) => sum + ((s.timeTaken || 0) / 60), 0);
  metrics.activity.weeklyTrend =
    lastWeekMinutes > prevWeekMinutes * 1.05
      ?'increasing'
      : lastWeekMinutes < prevWeekMinutes * 0.95
        ?'decreasing'
        :'stable';
  metrics.activity.activitiesLast30Days =
    completedTests.filter((t) => t.endTime && new Date(t.endTime) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length +
    submissions.filter((s) => s.submittedAt && new Date(s.submittedAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  // Anchor the prior-month reference for next improvementRate calc.
  prev.avgScore = combinedAvg;
  prev.completedCourses = completedCourses;

  metrics.metadata = metrics.metadata || {};
  metrics.metadata.lastUpdated = new Date();
  await metrics.save();

  return metrics;
};

module.exports = mongoose.model('StudentMetrics', StudentMetricsSchema);