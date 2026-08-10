const mongoose = require('mongoose');

// ============================================
// CHAPTER PROGRESS SUB-SCHEMA
// ============================================
const chapterProgressSchema = new mongoose.Schema({
  chapter_id: {
    type: String,
    required: true,
    index: true
  },
  chapter_name: {
    type: String,
    required: true
  },
  chapter_index: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started','in_progress','completed','paused','revisited'],
    default:'not_started',
    index: true
  },
  time_spent: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  completion_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Timestamps
  first_accessed_at: Date,
  last_accessed_at: Date,
  completed_at: Date,

  // Video-specific tracking
  video_progress: {
    watched_duration: {
      type: Number,
      default: 0
    },
    total_duration: {
      type: Number,
      default: 0
    },
    completion_rate: {
      type: Number,
      default: 0
    },
    playback_speeds_used: [{
      speed: Number,
      count: Number
    }],
    replay_count: {
      type: Number,
      default: 0
    },
    watched_segments: [{
      start: Number,
      end: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Content interaction tracking
  interactions: {
    file_downloads: {
      type: Number,
      default: 0
    },
    pdf_pages_viewed: {
      type: Number,
      default: 0
    },
    revisit_count: {
      type: Number,
      default: 0
    },
    bookmarks: [{
      timestamp: Number,
      note: String,
      created_at: {
        type: Date,
        default: Date.now
      }
    }],
    notes: [{
      content: String,
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: Date
    }]
  },

  // Quiz/assessment data
  assessment_data: {
    quiz_attempts: {
      type: Number,
      default: 0
    },
    highest_score: Number,
    last_attempt_score: Number,
    passed: {
      type: Boolean,
      default: false
    }
  }
}, { _id: false });

// ============================================
// MAIN COURSE PROGRESS SCHEMA
// ============================================
const courseProgressSchema = new mongoose.Schema({
  // ============================================
  // STUDENT & COURSE IDENTIFICATION
  // ============================================
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
    index: true
  },
  student_details: {
    name: String,
    email: String
  },

  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  course_details: {
    title: String,
    duration: Number,
    total_chapters: Number,
    instructor_id: mongoose.Schema.Types.ObjectId
  },

  purchase_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'PurchaseModel'
  },

  // ============================================
  // OVERALL PROGRESS METRICS
  // ============================================
  overall_progress: {
    completion_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true
    },
    status: {
      type: String,
      enum: ['not_started','in_progress','completed','paused','abandoned'],
      default:'not_started',
      index: true
    },
    total_time_spent: {
      type: Number,
      default: 0
    },
    effective_learning_time: {
      type: Number,
      default: 0
    },
    chapters_completed: {
      type: Number,
      default: 0
    },
    chapters_in_progress: {
      type: Number,
      default: 0
    },
    introduction_watched: {
      type: Boolean,
      default: false
    },
    introduction_watch_time: {
      type: Number,
      default: 0
    },
    last_chapter_accessed: {
      chapter_id: String,
      chapter_index: Number,
      accessed_at: Date
    },
    certificate_issued: {
      type: Boolean,
      default: false
    }
  },

  // ============================================
  // CHAPTER-WISE PROGRESS
  // ============================================
  chapters: [chapterProgressSchema],

  // ============================================
  // LEARNING ANALYTICS
  // ============================================
  analytics: {
    daily_streaks: {
      current_streak: {
        type: Number,
        default: 0
      },
      longest_streak: {
        type: Number,
        default: 0
      },
      last_activity_date: Date,
      streak_history: [{
        date: Date,
        activity_count: Number
      }]
    },

    learning_patterns: {
      preferred_learning_time: {
        type: String,
        enum: ['morning','afternoon','evening','night','mixed'],
        default:'mixed'
      },
      avg_session_duration: {
        type: Number,
        default: 0
      },
      total_sessions: {
        type: Number,
        default: 0
      },
      avg_sessions_per_week: {
        type: Number,
        default: 0
      },
      most_active_day: {
        type: String,
        enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      },
      learning_velocity: {
        type: Number,
        default: 0
      }
    },

    performance_metrics: {
      focus_score: {
        type: Number,
        default: 0
      },
      consistency_score: {
        type: Number,
        default: 0
      },
      engagement_score: {
        type: Number,
        default: 0
      },
      retention_score: {
        type: Number,
        default: 0
      },
      overall_performance_score: {
        type: Number,
        default: 0
      }
    },

    engagement_metrics: {
      total_interactions: {
        type: Number,
        default: 0
      },
      bookmarks_created: {
        type: Number,
        default: 0
      },
      notes_created: {
        type: Number,
        default: 0
      },
      files_downloaded: {
        type: Number,
        default: 0
      },
      chapters_revisited: {
        type: Number,
        default: 0
      }
    },

    prediction_data: {
      estimated_completion_date: Date,
      estimated_remaining_time: Number,
      completion_probability: {
        type: Number,
        default: 50
      },
      risk_factors: [{
        factor: String,
        severity: {
          type: String,
          enum: ['low','medium','high']
        }
      }]
    }
  },

  // ============================================
  // LEARNING MILESTONES & ACHIEVEMENTS
  // ============================================
  milestones: [{
    type: {
      type: String,
      enum: [
'first_chapter',
'25_percent',
'50_percent',
'75_percent',
'90_percent',
'course_completed',
'streak_milestone',
'speed_learner',
'consistent_learner',
'perfectionist',
'early_bird',
'night_owl',
'weekend_warrior'
      ]
    },
    achieved_at: {
      type: Date,
      default: Date.now
    },
    description: String,
    badge_url: String,
    points_earned: {
      type: Number,
      default: 0
    }
  }],

  // ============================================
  // SESSION TRACKING -  FIXED: REMOVED unique: true
  // ============================================
  learning_sessions: [{
    session_id: {
      type: String,
      required: true
      //  REMOVED: unique: true - This was causing the duplicate key error!
    },
    start_time: {
      type: Date,
      required: true
    },
    end_time: Date,
    duration: Number,
    effective_duration: Number,
    chapters_accessed: [String],

    activities: [{
      type: {
        type: String,
        enum: [
'video_watch',
'chapter_complete',
'chapter_access',
'note_add',
'bookmark_add',
'pause',
'resume',
'chapter_content_view',
'file_download',
'speed_change',
'fullscreen_toggle',
'seek',
'replay'
        ]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: mongoose.Schema.Types.Mixed,
      chapter_id: String
    }],

    session_metrics: {
      idle_time: {
        type: Number,
        default: 0
      },
      active_time: {
        type: Number,
        default: 0
      },
      interruptions: {
        type: Number,
        default: 0
      },
      focus_score: {
        type: Number,
        default: 0
      }
    }
  }],

  // ============================================
  // TIMESTAMPS
  // ============================================
  enrolled_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  first_accessed_at: Date,
  last_accessed_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  completed_at: Date,
  paused_at: Date,
  resumed_at: Date,

  // ============================================
  // METADATA
  // ============================================
  device_info: {
    last_device: String,
    browser: String,
    os: String,
    devices_used: [{
      device_type: String,
      count: Number,
      last_used: Date
    }]
  },

  // ============================================
  // CERTIFICATES & ACHIEVEMENTS
  // ============================================
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issued_at: Date,
    certificate_url: String,
    certificate_id: String,
    score: Number
  },

  // ============================================
  // NOTIFICATION & REMINDER SETTINGS
  // ============================================
  notification_preferences: {
    email_reminders: {
      type: Boolean,
      default: true
    },
    push_notifications: {
      type: Boolean,
      default: true
    },
    milestone_notifications: {
      type: Boolean,
      default: true
    },
    weekly_report: {
      type: Boolean,
      default: true
    }
  },

  // ============================================
  // FLAGS & STATUS
  // ============================================
  flags: {
    is_active: {
      type: Boolean,
      default: true
    },
    needs_attention: {
      type: Boolean,
      default: false
    },
    at_risk: {
      type: Boolean,
      default: false
    },
    high_performer: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true,
  collection:'course_progress',
  autoIndex: false //  Disable automatic index creation
});

// ============================================
// INDEXES FOR PERFORMANCE -  FIXED
// ============================================
courseProgressSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
courseProgressSchema.index({'overall_progress.status': 1 });
courseProgressSchema.index({'overall_progress.completion_percentage': 1 });
courseProgressSchema.index({ last_accessed_at: -1 });
courseProgressSchema.index({ completed_at: -1 });
courseProgressSchema.index({'analytics.daily_streaks.current_streak': -1 });
courseProgressSchema.index({'flags.is_active': 1 });
courseProgressSchema.index({ enrolled_at: 1 });
courseProgressSchema.index({'chapters.status': 1 });
//  Regular index on session_id (NOT unique)
courseProgressSchema.index({'learning_sessions.session_id': 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================
courseProgressSchema.virtual('is_completed').get(function () {
  return this.overall_progress.status ==='completed';
});

courseProgressSchema.virtual('days_since_enrollment').get(function () {
  if (!this.enrolled_at) return 0;
  return Math.floor((Date.now() - this.enrolled_at.getTime()) / (1000 * 60 * 60 * 24));
});

courseProgressSchema.virtual('average_progress_per_day').get(function () {
  const daysSince = this.days_since_enrollment;
  if (daysSince === 0) return 0;
  return this.overall_progress.completion_percentage / daysSince;
});

// ============================================
// PRE-SAVE MIDDLEWARE -  ENHANCED WITH NULL CHECK
// ============================================
courseProgressSchema.pre('save', function (next) {
  try {
    //  Filter out any null session_ids
    if (this.learning_sessions) {
      this.learning_sessions = this.learning_sessions.filter(s => s.session_id);
    }

    // Calculate overall progress
    if (this.chapters && this.chapters.length > 0) {
      const completedChapters = this.chapters.filter(ch => ch.status ==='completed').length;
      const inProgressChapters = this.chapters.filter(ch => ch.status ==='in_progress').length;
      const totalChapters = this.chapters.length;

      let totalProgress = 0;
      this.chapters.forEach(chapter => {
        totalProgress += chapter.completion_percentage;
      });

      let overallPercentage = totalChapters > 0 ? Math.round(totalProgress / totalChapters) : 0;

      if (this.overall_progress.introduction_watched) {
        overallPercentage = Math.min(100, overallPercentage);
      }

      this.overall_progress.completion_percentage = overallPercentage;
      this.overall_progress.chapters_completed = completedChapters;
      this.overall_progress.chapters_in_progress = inProgressChapters;

      if (overallPercentage === 0) {
        this.overall_progress.status ='not_started';
      } else if (overallPercentage === 100) {
        this.overall_progress.status ='completed';
        if (!this.completed_at) {
          this.completed_at = new Date();
        }
      } else {
        this.overall_progress.status ='in_progress';
      }

      this.overall_progress.total_time_spent = this.chapters.reduce(
        (total, ch) => total + (ch.time_spent || 0),
        0
      );
    }

    this.updateStreaks();
    this.calculatePerformanceScores();
    this.updateFlags();
    this.predictCompletion();

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

courseProgressSchema.methods.updateChapterProgress = function (chapterData) {
  const existingChapterIndex = this.chapters.findIndex(
    ch => ch.chapter_id === chapterData.chapter_id
  );

  const now = new Date();

  if (existingChapterIndex >= 0) {
    const existingChapter = this.chapters[existingChapterIndex];

    Object.assign(existingChapter, chapterData, {
      last_accessed_at: now
    });

    if (!existingChapter.first_accessed_at) {
      existingChapter.first_accessed_at = now;
    }

    if (chapterData.status ==='completed' && existingChapter.status !=='completed') {
      existingChapter.completed_at = now;
    }
  } else {
    this.chapters.push({
      ...chapterData,
      first_accessed_at: now,
      last_accessed_at: now
    });
  }

  this.overall_progress.last_chapter_accessed = {
    chapter_id: chapterData.chapter_id,
    chapter_index: chapterData.chapter_index,
    accessed_at: now
  };

  this.last_accessed_at = now;

  if (!this.first_accessed_at) {
    this.first_accessed_at = now;
  }

  return this.save();
};

courseProgressSchema.methods.updateSession = function (sessionData) {
  const existingSessionIndex = this.learning_sessions.findIndex(
    session => session.session_id === sessionData.session_id
  );

  if (existingSessionIndex >= 0) {
    Object.assign(this.learning_sessions[existingSessionIndex], sessionData);
  } else {
    this.learning_sessions.push(sessionData);
  }

  this.analytics.learning_patterns.total_sessions = this.learning_sessions.length;
  this.last_accessed_at = new Date();

  return this.save();
};

courseProgressSchema.methods.updateStreaks = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = this.analytics.daily_streaks.last_activity_date;

  if (!lastActivity) {
    this.analytics.daily_streaks.current_streak = 1;
    this.analytics.daily_streaks.longest_streak = 1;
    this.analytics.daily_streaks.last_activity_date = new Date();
    return;
  }

  const lastActivityDate = new Date(lastActivity);
  lastActivityDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return;
  } else if (diffDays === 1) {
    this.analytics.daily_streaks.current_streak += 1;

    if (this.analytics.daily_streaks.current_streak > this.analytics.daily_streaks.longest_streak) {
      this.analytics.daily_streaks.longest_streak = this.analytics.daily_streaks.current_streak;
    }
  } else {
    this.analytics.daily_streaks.current_streak = 1;
  }

  this.analytics.daily_streaks.last_activity_date = new Date();

  if (!this.analytics.daily_streaks.streak_history) {
    this.analytics.daily_streaks.streak_history = [];
  }

  this.analytics.daily_streaks.streak_history.push({
    date: new Date(),
    activity_count: this.learning_sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    }).length
  });
};

courseProgressSchema.methods.calculatePerformanceScores = function () {
  const metrics = this.analytics.performance_metrics;

  const avgSessionDuration = this.analytics.learning_patterns.avg_session_duration || 0;
  const avgIdleTime = this.learning_sessions.reduce((sum, s) =>
    sum + (s.session_metrics?.idle_time || 0), 0) / (this.learning_sessions.length || 1);

  metrics.focus_score = Math.max(0, Math.min(100,
    100 - (avgIdleTime / avgSessionDuration) * 100
  ));

  metrics.consistency_score = Math.min(100,
    (this.analytics.daily_streaks.current_streak * 10) +
    (this.analytics.learning_patterns.avg_sessions_per_week * 5)
  );

  const engagementMetrics = this.analytics.engagement_metrics;
  metrics.engagement_score = Math.min(100,
    (engagementMetrics.total_interactions * 2) +
    (engagementMetrics.notes_created * 5) +
    (engagementMetrics.bookmarks_created * 3) +
    (this.overall_progress.completion_percentage * 0.5)
  );

  metrics.retention_score = Math.min(100,
    (engagementMetrics.chapters_revisited * 10) +
    (this.overall_progress.completion_percentage * 0.5)
  );

  metrics.overall_performance_score = Math.round(
    (metrics.focus_score * 0.25) +
    (metrics.consistency_score * 0.30) +
    (metrics.engagement_score * 0.25) +
    (metrics.retention_score * 0.20)
  );
};

courseProgressSchema.methods.updateFlags = function () {
  const daysSinceEnrollment = this.days_since_enrollment;
  const daysSinceLastAccess = this.last_accessed_at ?
    Math.floor((Date.now() - this.last_accessed_at.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  this.flags.at_risk = daysSinceLastAccess > 7 &&
    this.overall_progress.status !=='completed';

  const expectedProgress = Math.min(100, (daysSinceEnrollment / 30) * 100);
  this.flags.needs_attention = this.overall_progress.completion_percentage < (expectedProgress * 0.5);

  this.flags.high_performer =
    this.overall_progress.completion_percentage > 80 &&
    this.analytics.performance_metrics.overall_performance_score > 75;
};

courseProgressSchema.methods.predictCompletion = function () {
  const currentProgress = this.overall_progress.completion_percentage;
  const daysSinceEnrollment = this.days_since_enrollment;

  if (daysSinceEnrollment === 0 || currentProgress === 0) {
    return;
  }

  const avgProgressPerDay = currentProgress / daysSinceEnrollment;
  const remainingProgress = 100 - currentProgress;
  const estimatedDaysRemaining = Math.ceil(remainingProgress / avgProgressPerDay);

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysRemaining);

  this.analytics.prediction_data.estimated_completion_date = estimatedCompletionDate;
  this.analytics.prediction_data.estimated_remaining_time =
    (this.course_details.duration || 0) * (remainingProgress / 100);

  const engagementFactor = this.analytics.performance_metrics.engagement_score / 100;
  const consistencyFactor = this.analytics.performance_metrics.consistency_score / 100;
  const progressFactor = currentProgress / 100;

  this.analytics.prediction_data.completion_probability = Math.round(
    (engagementFactor * 0.4 + consistencyFactor * 0.4 + progressFactor * 0.2) * 100
  );

  this.analytics.prediction_data.risk_factors = [];

  if (this.analytics.daily_streaks.current_streak < 3) {
    this.analytics.prediction_data.risk_factors.push({
      factor:'Low learning streak',
      severity:'medium'
    });
  }

  if (avgProgressPerDay < 2) {
    this.analytics.prediction_data.risk_factors.push({
      factor:'Slow progress rate',
      severity:'high'
    });
  }

  if (this.analytics.engagement_metrics.total_interactions < 10) {
    this.analytics.prediction_data.risk_factors.push({
      factor:'Low engagement',
      severity:'medium'
    });
  }
};

courseProgressSchema.methods.checkMilestones = function () {
  const progress = this.overall_progress.completion_percentage;
  const newMilestones = [];

  const milestoneTypes = [
    { type:'first_chapter', threshold: 0, desc:'Completed your first chapter!', points: 10 },
    { type:'25_percent', threshold: 25, desc:'Reached 25% completion!', points: 25 },
    { type:'50_percent', threshold: 50, desc:'Halfway there! 50% complete!', points: 50 },
    { type:'75_percent', threshold: 75, desc:'Almost done! 75% complete!', points: 75 },
    { type:'90_percent', threshold: 90, desc:'Final stretch! 90% complete!', points: 90 },
    { type:'course_completed', threshold: 100, desc:'Congratulations! Course completed!', points: 200 }
  ];

  milestoneTypes.forEach(milestone => {
    const alreadyAchieved = this.milestones.some(m => m.type === milestone.type);

    if (!alreadyAchieved && progress >= milestone.threshold) {
      newMilestones.push({
        type: milestone.type,
        achieved_at: new Date(),
        description: milestone.desc,
        points_earned: milestone.points
      });
    }
  });

  const streak = this.analytics.daily_streaks.current_streak;
  if (streak >= 7 && !this.milestones.some(m => m.type ==='streak_milestone' && m.description.includes('7'))) {
    newMilestones.push({
      type:'streak_milestone',
      achieved_at: new Date(),
      description:'7-day learning streak achieved!',
      points_earned: 30
    });
  }

  if (newMilestones.length > 0) {
    this.milestones.push(...newMilestones);
    return newMilestones;
  }

  return [];
};

// ============================================
// STATIC METHODS
// ============================================

courseProgressSchema.statics.getCourseStatistics = async function (courseId) {
  return await this.aggregate([
    { $match: { course_id: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        total_students: { $sum: 1 },
        completed_students: {
          $sum: { $cond: [{ $eq: ['$overall_progress.status','completed'] }, 1, 0] }
        },
        avg_completion: { $avg:'$overall_progress.completion_percentage' },
        avg_time_spent: { $avg:'$overall_progress.total_time_spent' },
        avg_performance_score: { $avg:'$analytics.performance_metrics.overall_performance_score' }
      }
    }
  ]);
};

courseProgressSchema.statics.getLeaderboard = async function (courseId, limit = 10) {
  return await this.find({ course_id: courseId })
    .sort({
'overall_progress.completion_percentage': -1,
'analytics.performance_metrics.overall_performance_score': -1,
'overall_progress.total_time_spent': 1
    })
    .limit(limit)
    .populate('student_id','name email')
    .select('student_id student_details overall_progress analytics.performance_metrics');
};

courseProgressSchema.statics.findAtRiskStudents = async function (courseId) {
  return await this.find({
    course_id: courseId,
'flags.at_risk': true,
'overall_progress.status': { $ne:'completed' }
  })
    .populate('student_id','name email')
    .select('student_id student_details overall_progress last_accessed_at');
};

// ============================================
// MODEL CREATION
// ============================================
const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

module.exports = CourseProgress;
