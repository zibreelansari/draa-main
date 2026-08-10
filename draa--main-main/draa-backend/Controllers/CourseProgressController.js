const express = require('express');
const router = express.Router();
const CourseProgress = require('../Models/CourseProgressModels');
const User = require('../Models/UserModel');
const Course = require('../Models/CourseModel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { generateCertificate, generateCertificateBuffer } = require('./CertificateController');
const { sendCertificateMail } = require('../utils/sendCertificateMail');


const { authMiddleware } = require('../Middlewares/student.auth.middleware');



// routes protected
router.use(authMiddleware);
// ============================================
// MIDDLEWARE
// ============================================

// Request validation middleware
const validateRequest = (req, res, next) => {
  const { studentId, courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message:'Invalid student ID format'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message:'Invalid course ID format'
    });
  }

  next();
};

// ============================================
// CORE ROUTES (Fixed paths)
// ============================================

//  Get or Create Course Progress - FIXED PATH
router.get('/:studentId/:courseId', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    console.log(` Getting progress for student ${studentId}, course ${courseId}`);

    let progress = await CourseProgress.findOne({
      student_id: studentId,
      course_id: courseId
    }).lean();

    if (!progress) {
      //  Create new progress record WITHOUT learning_sessions array to avoid null session_id
      const newProgress = new CourseProgress({
        student_id: studentId,
        course_id: courseId,
        student_details: {
          name: req.query.student_name ||'',
          email: req.query.student_email ||''
        },
        course_details: {
          title: req.query.course_title ||'',
          duration: parseInt(req.query.course_duration) || 0,
          total_chapters: parseInt(req.query.total_chapters) || 0
        },
        enrolled_at: new Date(),
        learning_sessions: [], //  Initialize as empty array instead of with null session
        flags: {
          is_active: true,
          needs_attention: false,
          at_risk: false,
          high_performer: false
        }
      });

      await newProgress.save();
      console.log(' New progress record created');

      progress = newProgress.toObject();
    }

    res.json({
      success: true,
      data: progress,
      message:'Course progress retrieved successfully'
    });

  } catch (error) {
    console.error(' Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get course progress',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  Generate Certificate - NEW
router.get('/generate/:studentId/:courseId', validateRequest, generateCertificate);

//  Update Chapter Progress - FIXED PATH
router.post('/:studentId/:courseId/chapter', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const {
      chapter_id,
      chapter_name,
      chapter_index,
      status,
      time_spent,
      completion_percentage,
      video_progress,
      interactions,
      assessment_data
    } = req.body;

    // Validation
    if (!chapter_id || !chapter_name || chapter_index === undefined) {
      return res.status(400).json({
        success: false,
        message:'Missing required fields: chapter_id, chapter_name, chapter_index'
      });
    }

    if (completion_percentage !== undefined && (completion_percentage < 0 || completion_percentage > 100)) {
      return res.status(400).json({
        success: false,
        message:'Completion percentage must be between 0 and 100'
      });
    }

    console.log(` Updating chapter progress: ${chapter_name} (${status ||'in_progress'})`);

    const maxRetries = 5;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        let progress = await CourseProgress.findOne({
          student_id: studentId,
          course_id: courseId
        });

        if (!progress) {
          return res.status(404).json({
            success: false,
            message:'Course progress not found. Please initialize progress first.'
          });
        }

        const chapterData = {
          chapter_id,
          chapter_name,
          chapter_index,
          status: status ||'in_progress',
          time_spent: time_spent || 0,
          completion_percentage: completion_percentage !== undefined ? completion_percentage : 0
        };

        if (video_progress) {
          chapterData.video_progress = {
            watched_duration: video_progress.watched_duration || 0,
            total_duration: video_progress.total_duration || 0,
            completion_rate: video_progress.completion_rate || 0,
            watched_segments: video_progress.watched_segments || []
          };
        }

        if (interactions) {
          chapterData.interactions = interactions;
        }

        if (assessment_data) {
          chapterData.assessment_data = assessment_data;
        }

        if (status ==='completed') {
          chapterData.completed_at = new Date();
        }

        await progress.updateChapterProgress(chapterData);

        progress = await CourseProgress.findOne({
          student_id: studentId,
          course_id: courseId
        });

        const newMilestones = progress.checkMilestones();

        if (newMilestones.length > 0) {
          await progress.save();
          console.log(` New milestones achieved: ${newMilestones.map(m => m.type).join(',')}`);
        }

        console.log(` Chapter progress updated: ${progress.overall_progress.completion_percentage}% overall`);

        // Recompute aggregate metrics so leaderboard points / mastery / course
        // completion count reflect this chapter update.
        try {
          const StudentMetrics = require('../Models/StudentMetricsModel');
          if (mongoose.Types.ObjectId.isValid(studentId)) {
            await StudentMetrics.refreshAll(studentId);
          }
        } catch (metricsErr) {
          console.error(' Failed to refresh metrics after course progress:', metricsErr.message);
        }

        // --- AUTOMATED CERTIFICATE ISSUANCE ---
        if (progress.overall_progress.completion_percentage === 100 && !progress.overall_progress.certificate_issued) {
          setImmediate(async () => {
            try {
              console.log(` Course Completed! Issuing certificate for student ${studentId}...`);

              const student = await User.findById(studentId);
              const course = await Course.findById(courseId);
              const certBuffer = await generateCertificateBuffer(studentId, courseId);

              if (certBuffer && student) {
                await sendCertificateMail({
                  studentName: student.name,
                  email: student.email,
                  courseTitle: course.title,
                  certificateBuffer: certBuffer
                });

                await CourseProgress.updateOne(
                  { _id: progress._id },
                  { $set: {'overall_progress.certificate_issued': true } }
                );
                console.log(` Certificate sent to ${student.email}`);
              }
            } catch (err) {
              console.error(' Failed to issue automated certificate:', err.message);
            }
          });
        }

        return res.json({
          success: true,
          message:'Chapter progress updated successfully',
          data: {
            overall_progress: progress.overall_progress,
            chapter_progress: progress.chapters.find(ch => ch.chapter_id === chapter_id),
            new_milestones: newMilestones,
            analytics: {
              performance_metrics: progress.analytics.performance_metrics,
              daily_streaks: progress.analytics.daily_streaks
            }
          }
        });

      } catch (error) {
        lastError = error;

        if ((error.name ==='VersionError' || error.code === 11000) && retryCount < maxRetries - 1) {
          retryCount++;
          const backoffDelay = Math.min(1000, 50 * Math.pow(2, retryCount));
          console.log(` Retrying chapter update (attempt ${retryCount + 1}/${maxRetries}) after ${backoffDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        throw error;
      }
    }

    throw lastError;

  } catch (error) {
    console.error(' Error updating chapter progress:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update chapter progress',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  Update Introduction Video Progress - FIXED PATH
router.post('/:studentId/:courseId/introduction', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { watched, watch_time } = req.body;

    if (typeof watched !=='boolean') {
      return res.status(400).json({
        success: false,
        message:'watched field must be a boolean'
      });
    }

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId
      },
      {
        $set: {
'overall_progress.introduction_watched': watched,
'overall_progress.introduction_watch_time': watch_time || 0,
'last_accessed_at': new Date()
        },
        $setOnInsert: {
'first_accessed_at': new Date()
        }
      },
      {
        new: true,
        upsert: false,
        runValidators: true
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Course progress not found'
      });
    }

    console.log(` Introduction progress updated: watched=${watched}`);

    res.json({
      success: true,
      message:'Introduction progress updated',
      data: {
        introduction_watched: result.overall_progress.introduction_watched,
        introduction_watch_time: result.overall_progress.introduction_watch_time
      }
    });

  } catch (error) {
    console.error(' Error updating introduction progress:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update introduction progress',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

// ============================================
// SESSION MANAGEMENT - FIXED PATHS
// ============================================

//  Start Learning Session - FIXED PATH
router.post('/:studentId/:courseId/session/start', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { device_info } = req.body;

    const sessionId = uuidv4();
    const now = new Date();

    const sessionData = {
      session_id: sessionId, //  Must have a valid UUID, not null
      start_time: now,
      chapters_accessed: [],
      activities: [],
      session_metrics: {
        idle_time: 0,
        active_time: 0,
        interruptions: 0,
        focus_score: 0
      }
    };

    const updateData = {
      $push: {
        learning_sessions: {
          $each: [sessionData],
          $slice: -100
        }
      },
      $set: {
        last_accessed_at: now
      },
      $setOnInsert: {
        first_accessed_at: now
      },
      $inc: {
'analytics.learning_patterns.total_sessions': 1
      }
    };

    if (device_info) {
      updateData.$set['device_info.last_device'] = device_info.device ||'Unknown';
      updateData.$set['device_info.browser'] = device_info.browser ||'Unknown';
      updateData.$set['device_info.os'] = device_info.os ||'Unknown';
    }

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId
      },
      updateData,
      {
        new: true,
        upsert: false,
        runValidators: true
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Course progress not found'
      });
    }

    console.log(` Learning session started: ${sessionId}`);

    res.json({
      success: true,
      message:'Session started successfully',
      data: {
        session_id: sessionId,
        start_time: now,
        total_sessions: result.analytics.learning_patterns.total_sessions
      }
    });

  } catch (error) {
    console.error(' Error starting session:', error);
    res.status(500).json({
      success: false,
      message:'Failed to start session',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  End Learning Session - FIXED PATH
router.post('/:studentId/:courseId/session/end', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { session_id, end_time, total_duration, idle_time, chapters_accessed } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message:'session_id is required'
      });
    }

    const endTimeDate = end_time ? new Date(end_time) : new Date();
    const effectiveDuration = total_duration - (idle_time || 0);
    const focusScore = total_duration > 0 ?
      Math.round(((total_duration - (idle_time || 0)) / total_duration) * 100) : 0;

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId,
'learning_sessions.session_id': session_id
      },
      {
        $set: {
'learning_sessions.$.end_time': endTimeDate,
'learning_sessions.$.duration': total_duration || 0,
'learning_sessions.$.effective_duration': effectiveDuration,
'learning_sessions.$.session_metrics.idle_time': idle_time || 0,
'learning_sessions.$.session_metrics.active_time': effectiveDuration,
'learning_sessions.$.session_metrics.focus_score': focusScore,
'last_accessed_at': endTimeDate
        },
        $addToSet: {
'learning_sessions.$.chapters_accessed': { $each: chapters_accessed || [] }
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      console.warn(` Session not found: ${session_id}`);
      return res.json({
        success: true,
        message:'Session ended (session not found - may have been cleaned up)',
        warning:'Session not found'
      });
    }

    setImmediate(async () => {
      try {
        const progress = await CourseProgress.findOne({
          student_id: studentId,
          course_id: courseId
        });

        if (progress) {
          updateLearningAnalytics(progress);
          await progress.save();
          console.log(` Analytics updated for session ${session_id}`);
        }
      } catch (analyticsError) {
        console.error(' Error updating analytics:', analyticsError.message);
      }
    });

    console.log(` Learning session ended: ${session_id} (${total_duration}s, focus: ${focusScore}%)`);

    res.json({
      success: true,
      message:'Session ended successfully',
      data: {
        session_id,
        duration: total_duration,
        effective_duration: effectiveDuration,
        focus_score: focusScore
      }
    });

  } catch (error) {
    console.error(' Error ending session:', error);
    res.status(500).json({
      success: false,
      message:'Failed to end session',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  Get Active Session - FIXED PATH
router.get('/:studentId/:courseId/session/active', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const progress = await CourseProgress.findOne({
      student_id: studentId,
      course_id: courseId
    }).lean();

    if (!progress) {
      return res.status(404).json({
        success: false,
        message:'Course progress not found'
      });
    }

    const activeSession = progress.learning_sessions
      .reverse()
      .find(session => !session.end_time);

    if (!activeSession) {
      return res.json({
        success: true,
        message:'No active session found',
        data: null
      });
    }

    res.json({
      success: true,
      message:'Active session found',
      data: activeSession
    });

  } catch (error) {
    console.error(' Error getting active session:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get active session',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

// ============================================
// ACTIVITY TRACKING - FIXED PATHS
// ============================================

//  Add Learning Activity - FIXED PATH
router.post('/:studentId/:courseId/activity', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { session_id, activity_type, details, chapter_id } = req.body;

    const validActivityTypes = [
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
    ];

    if (!activity_type) {
      return res.status(400).json({
        success: false,
        message:'activity_type is required'
      });
    }

    if (!validActivityTypes.includes(activity_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid activity type. Valid types: ${validActivityTypes.join(',')}`,
        received: activity_type
      });
    }

    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        const activity = {
          type: activity_type,
          timestamp: new Date(),
          details: details || {},
          chapter_id: chapter_id || null
        };

        const result = await CourseProgress.findOneAndUpdate(
          {
            student_id: studentId,
            course_id: courseId,
'learning_sessions.session_id': session_id
          },
          {
            $push: {
'learning_sessions.$.activities': activity
            },
            $set: {
'last_accessed_at': new Date()
            },
            $inc: {
'analytics.engagement_metrics.total_interactions': 1
            }
          },
          {
            new: true,
            runValidators: true
          }
        );

        if (!result) {
          console.warn(` Session not found: ${session_id}`);
          return res.json({
            success: true,
            message:'Activity logged (session not found - may have ended)',
            warning:'Session not found'
          });
        }

        console.log(` Activity logged: ${activity_type} for session ${session_id}`);

        return res.json({
          success: true,
          message:'Activity logged successfully',
          data: {
            activity_type,
            timestamp: activity.timestamp
          }
        });

      } catch (error) {
        lastError = error;

        if ((error.name ==='VersionError' || error.code === 11000) && retryCount < maxRetries - 1) {
          retryCount++;
          const backoffDelay = 25 * Math.pow(2, retryCount);
          console.log(` Retrying activity logging (attempt ${retryCount + 1}/${maxRetries}) for ${activity_type}`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        throw error;
      }
    }

    throw lastError;

  } catch (error) {
    console.error(' Error logging activity:', error);

    res.json({
      success: true,
      message:'Activity logging failed but request succeeded',
      warning: process.env.NODE_ENV ==='development' ? error.message :'Activity logging error'
    });
  }
});

//  Bulk Activity Logging - FIXED PATH
router.post('/:studentId/:courseId/activities/batch', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { session_id, activities } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message:'session_id is required'
      });
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message:'Activities array is required and must not be empty'
      });
    }

    if (activities.length > 100) {
      return res.status(400).json({
        success: false,
        message:'Maximum 100 activities can be logged at once'
      });
    }

    console.log(` Batch logging ${activities.length} activities for session ${session_id}`);

    const preparedActivities = activities.map(activity => ({
      type: activity.type,
      timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
      details: activity.details || {},
      chapter_id: activity.chapter_id || null
    }));

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId,
'learning_sessions.session_id': session_id
      },
      {
        $push: {
'learning_sessions.$.activities': {
            $each: preparedActivities
          }
        },
        $set: {
'last_accessed_at': new Date()
        },
        $inc: {
'analytics.engagement_metrics.total_interactions': activities.length
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      return res.json({
        success: true,
        message:'Batch activities logged (session not found)',
        warning:'Session not found'
      });
    }

    console.log(` Batch activities logged: ${activities.length} activities for session ${session_id}`);

    res.json({
      success: true,
      message: `${activities.length} activities logged successfully`,
      data: {
        activities_logged: activities.length,
        total_interactions: result.analytics.engagement_metrics.total_interactions
      }
    });

  } catch (error) {
    console.error(' Error logging batch activities:', error);
    res.json({
      success: true,
      message:'Some activities may not have been logged',
      warning: process.env.NODE_ENV ==='development' ? error.message :'Batch activity logging error'
    });
  }
});

//  Get Comprehensive Learning Analytics - FIXED PATH
router.get('/analytics/:studentId/:courseId', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const progress = await CourseProgress.findOne({
      student_id: studentId,
      course_id: courseId
    }).lean();

    if (!progress) {
      return res.status(404).json({
        success: false,
        message:'Course progress not found'
      });
    }

    const completedChapters = progress.chapters.filter(ch => ch.status ==='completed');
    const totalTimeInHours = (progress.overall_progress.total_time_spent / 3600).toFixed(2);

    const avgChapterTime = completedChapters.length > 0 ?
      Math.round(completedChapters.reduce((sum, ch) => sum + ch.time_spent, 0) / completedChapters.length / 60) : 0;

    const recentSessions = progress.learning_sessions
      .filter(s => s.end_time)
      .slice(-10)
      .reverse();

    const analytics = {
      overview: {
        completion_percentage: progress.overall_progress.completion_percentage,
        status: progress.overall_progress.status,
        total_time_spent: progress.overall_progress.total_time_spent,
        total_time_hours: parseFloat(totalTimeInHours),
        chapters_completed: progress.overall_progress.chapters_completed,
        chapters_in_progress: progress.overall_progress.chapters_in_progress,
        chapters_total: progress.chapters.length,
        enrolled_at: progress.enrolled_at,
        last_accessed_at: progress.last_accessed_at
      },

      chapter_breakdown: progress.chapters.map(ch => ({
        chapter_id: ch.chapter_id,
        chapter_name: ch.chapter_name,
        chapter_index: ch.chapter_index,
        status: ch.status,
        time_spent: ch.time_spent,
        time_spent_minutes: Math.round(ch.time_spent / 60),
        completion_percentage: ch.completion_percentage,
        last_accessed: ch.last_accessed_at,
        video_completion_rate: ch.video_progress?.completion_rate || 0
      })).sort((a, b) => a.chapter_index - b.chapter_index),

      performance_metrics: {
        ...progress.analytics.performance_metrics,
        avg_chapter_completion_time_minutes: avgChapterTime
      },

      learning_patterns: progress.analytics.learning_patterns,

      daily_streaks: progress.analytics.daily_streaks,

      engagement_metrics: progress.analytics.engagement_metrics,

      milestones: progress.milestones.map(m => ({
        type: m.type,
        description: m.description,
        achieved_at: m.achieved_at,
        points_earned: m.points_earned
      })),

      recent_sessions: recentSessions.map(s => ({
        session_id: s.session_id,
        start_time: s.start_time,
        end_time: s.end_time,
        duration: s.duration,
        duration_minutes: Math.round(s.duration / 60),
        effective_duration: s.effective_duration,
        chapters_accessed: s.chapters_accessed,
        activities_count: s.activities.length,
        focus_score: s.session_metrics?.focus_score || 0
      })),

      flags: progress.flags
    };

    res.json({
      success: true,
      data: analytics,
      message:'Analytics retrieved successfully'
    });

  } catch (error) {
    console.error(' Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get analytics',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  Add Bookmark to Chapter - FIXED PATH
router.post('/:studentId/:courseId/chapter/:chapterId/bookmark', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId, chapterId } = req.params;
    const { timestamp, note } = req.body;

    if (timestamp === undefined) {
      return res.status(400).json({
        success: false,
        message:'timestamp is required'
      });
    }

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId,
'chapters.chapter_id': chapterId
      },
      {
        $push: {
'chapters.$.interactions.bookmarks': {
            timestamp,
            note: note ||'',
            created_at: new Date()
          }
        },
        $inc: {
'analytics.engagement_metrics.bookmarks_created': 1
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Chapter not found'
      });
    }

    console.log(` Bookmark added to chapter ${chapterId} at ${timestamp}s`);

    res.json({
      success: true,
      message:'Bookmark added successfully'
    });

  } catch (error) {
    console.error(' Error adding bookmark:', error);
    res.status(500).json({
      success: false,
      message:'Failed to add bookmark',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

//  Add Note to Chapter - FIXED PATH
router.post('/:studentId/:courseId/chapter/:chapterId/note', validateRequest, async (req, res) => {
  try {
    const { studentId, courseId, chapterId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message:'content is required'
      });
    }

    const result = await CourseProgress.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: courseId,
'chapters.chapter_id': chapterId
      },
      {
        $push: {
'chapters.$.interactions.notes': {
            content,
            created_at: new Date()
          }
        },
        $inc: {
'analytics.engagement_metrics.notes_created': 1
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Chapter not found'
      });
    }

    console.log(` Note added to chapter ${chapterId}`);

    res.json({
      success: true,
      message:'Note added successfully'
    });

  } catch (error) {
    console.error(' Error adding note:', error);
    res.status(500).json({
      success: false,
      message:'Failed to add note',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
});

// Helper function to update learning analytics
function updateLearningAnalytics(progress) {
  try {
    const sessions = progress.learning_sessions.filter(s => s.end_time && s.duration);

    if (sessions.length > 0) {
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      progress.analytics.learning_patterns.avg_session_duration =
        Math.round(totalDuration / sessions.length / 60);

      const totalEffectiveDuration = sessions.reduce(
        (sum, s) => sum + (s.effective_duration || s.duration || 0), 0
      );
      progress.overall_progress.effective_learning_time = totalEffectiveDuration;

      const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      sessions.forEach(session => {
        const hour = new Date(session.start_time).getHours();
        if (hour >= 5 && hour < 12) hourCounts.morning++;
        else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
        else if (hour >= 17 && hour < 22) hourCounts.evening++;
        else hourCounts.night++;
      });

      const maxTime = Math.max(...Object.values(hourCounts));
      progress.analytics.learning_patterns.preferred_learning_time =
        Object.keys(hourCounts).find(key => hourCounts[key] === maxTime) ||'mixed';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = progress.analytics.daily_streaks.last_activity_date;

    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        progress.analytics.daily_streaks.current_streak += 1;

        if (progress.analytics.daily_streaks.current_streak >
          progress.analytics.daily_streaks.longest_streak) {
          progress.analytics.daily_streaks.longest_streak =
            progress.analytics.daily_streaks.current_streak;
        }
      } else if (diffDays > 1) {
        progress.analytics.daily_streaks.current_streak = 1;
      }
    } else {
      progress.analytics.daily_streaks.current_streak = 1;
      progress.analytics.daily_streaks.longest_streak = 1;
    }

    progress.analytics.daily_streaks.last_activity_date = new Date();

  } catch (error) {
    console.error(' Error in updateLearningAnalytics:', error.message);
  }
}

module.exports = router;
