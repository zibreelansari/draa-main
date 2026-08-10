const express = require('express');
const router = express.Router();
const TestSeries = require('../Models/TestSeriesModels');
const TestAttempt = require('../Models/TestSeriesAttempt');
const TestSeriesPurchase = require('../Models/TestSeriesPurchaseModel');
const mongoose = require('mongoose');

// START TEST - Create New Attempt
const startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    // Prefer authenticated user; fall back to body for legacy callers.
    const studentId = (req.user && (req.user._id || req.user.id)) || req.body.studentId;

    console.log(" Starting test:", { testId, studentId });

    const testSeries = await TestSeries.findById(testId).populate("createdBy","name tname");

    if (!testSeries || testSeries.status !=="approved" || !testSeries.isActive) {
      return res.status(404).json({
        success: false,
        message:"Test series not found or not available",
      });
    }

    // ======================================================
    // CHECK FOR EXISTING ONGOING ATTEMPT
    // ======================================================

    const ongoingAttempt = await TestAttempt.findOne({
      testSeries: testId,
      user: studentId,
      status:"ongoing",
    });

    if (ongoingAttempt) {

      const timeRemaining = Math.max(
        0,
        Math.floor((new Date(ongoingAttempt.endTime) - new Date()) / 1000)
      );

      // Auto-submit if time expired
      if (timeRemaining <= 0) {
        ongoingAttempt.status ="completed";
        ongoingAttempt.endTime = new Date();
        await ongoingAttempt.save();

        return res.json({
          success: true,
          message:"Test time expired and has been auto-submitted",
          timeExpired: true,
          attempt: {
            attemptId: ongoingAttempt._id,
            status: "completed",
            message: "Your test time has expired. The test has been auto-submitted."
          }
        });
      }

      return res.json({
        success: true,
        message:"Resuming existing test attempt",
        attempt: {
          attemptId: ongoingAttempt._id,
          testSeries: {
            id: testSeries._id,
            title: testSeries.title,
            duration: testSeries.duration,
            totalMarks: testSeries.totalMarks,
            instructions: testSeries.instructions || [],
          },

          questions: testSeries.questions.map((q, index) => ({
            id: q._id,
            questionNumber: index + 1,
            questionText: q.questionText,
            options: q.options.map((opt) => ({ text: opt.text })),
            marks: q.marks,
            negativeMarks: q.negativeMarks || 0,
            difficulty: q.difficulty,
            subject: q.subject,
            topic: q.topic,
          })),

          startTime: ongoingAttempt.startTime,
          timeRemaining,

          savedAnswers: ongoingAttempt.answers.reduce((acc, answer) => {
            acc[answer.questionId.toString()] = answer.selectedOption;
            return acc;
          }, {}),
        },
      });
    }

    // ======================================================
    // PAID TEST ACCESS CHECK
    // ======================================================

    if (testSeries.isPaid) {
      const purchase = await TestSeriesPurchase.findOne({
        student_id: studentId,
        test_series_id: testId,
"purchase_details.payment_status":"completed",
"purchase_details.access_granted": true,
      }).sort({"purchase_details.purchase_date": -1 });

      if (!purchase) {
        return res.status(403).json({
          success: false,
          message:"Access denied. Please purchase this test series first.",
        });
      }

      if (
        purchase.purchase_details.access_expires_at &&
        new Date() > purchase.purchase_details.access_expires_at
      ) {
        return res.status(403).json({
          success: false,
          message:"Access to this test series has expired",
        });
      }
    }

    // ======================================================
    // CREATE NEW TEST ATTEMPT
    // ======================================================

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + testSeries.duration * 60 * 1000);

    const newAttempt = new TestAttempt({
      testSeries: testId,
      user: studentId,
      startTime,
      endTime,
      status:"ongoing",
      answers: [],
      unanswered: testSeries.questions.length,
    });

    await newAttempt.save();

    console.log(" Test attempt created:", newAttempt._id);

    const timeRemaining = Math.floor((endTime - new Date()) / 1000);

    return res.json({
      success: true,
      message:"Test started successfully",
      attempt: {
        attemptId: newAttempt._id,

        testSeries: {
          id: testSeries._id,
          title: testSeries.title,
          duration: testSeries.duration,
          totalMarks: testSeries.totalMarks,
          instructions: testSeries.instructions || [],
        },

        questions: testSeries.questions.map((q, index) => ({
          id: q._id,
          questionNumber: index + 1,
          questionText: q.questionText,
          options: q.options.map((opt) => ({ text: opt.text })),
          marks: q.marks,
          negativeMarks: q.negativeMarks || 0,
          difficulty: q.difficulty,
          subject: q.subject,
          topic: q.topic,
        })),

        startTime,
        timeRemaining,
        savedAnswers: {},
      },
    });

  } catch (error) {
    console.error(" Error starting test:", error);

    return res.status(500).json({
      success: false,
      message:"Failed to start test",
      error: error.message,
    });
  }
};


// SUBMIT ANSWER - Save Individual Answer
const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;

    console.log(" Saving answer:", { attemptId, questionId, selectedOption });

    const attempt = await TestAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:"Test attempt not found",
      });
    }

    if (attempt.status !=="ongoing") {
      return res.status(400).json({
        success: false,
        message:"Test already submitted or completed",
      });
    }

    // ----------------------------------------------------
    // TIMER PROTECTION (Important)
    // ----------------------------------------------------

    if (attempt.endTime && new Date() > attempt.endTime) {
      attempt.status ="completed";
      await attempt.save();

      return res.json({
        success: true,
        message:"Test time expired. Test has been auto-submitted.",
        timeExpired: true,
        attempt: {
          attemptId: attempt._id,
          status: "completed",
          message: "Your test time has expired. The test has been auto-submitted with your current answers."
        }
      });
    }

    // ----------------------------------------------------
    // LOAD TEST SERIES
    // ----------------------------------------------------

    const testSeries = await TestSeries.findById(attempt.testSeries);

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:"Test series not found",
      });
    }

    const question = testSeries.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message:"Question not found",
      });
    }

    // ----------------------------------------------------
    // CHECK IF ANSWER ALREADY EXISTS
    // ----------------------------------------------------

    const existingAnswerIndex = attempt.answers.findIndex(
      (ans) => ans.questionId.toString() === questionId
    );

    const correctOption = question.options.findIndex((opt) => opt.isCorrect);
    const isCorrect = selectedOption === correctOption;

    const marksObtained = isCorrect
      ? question.marks
      : -(question.negativeMarks || 0);

    const answerData = {
      questionId,
      selectedOption,
      isCorrect,
      marksObtained,
      timeSpent: timeSpent || 0,
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    // ----------------------------------------------------
    // UPDATE STATISTICS
    // ----------------------------------------------------

    const correctAnswers = attempt.answers.filter((ans) => ans.isCorrect).length;

    const incorrectAnswers = attempt.answers.filter(
      (ans) => !ans.isCorrect && ans.selectedOption !== undefined
    ).length;

    const totalScore = attempt.answers.reduce(
      (sum, ans) => sum + ans.marksObtained,
      0
    );

    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.unanswered = testSeries.questions.length - attempt.answers.length;
    attempt.totalScore = totalScore;

    attempt.percentage =
      testSeries.totalMarks > 0
        ? Math.max(0, (totalScore / testSeries.totalMarks) * 100)
        : 0;

    await attempt.save();

    // ----------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------

    res.json({
      success: true,
      message:"Answer saved successfully",
      stats: {
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        unanswered: attempt.unanswered,
        totalScore: attempt.totalScore,
        percentage: Math.round(attempt.percentage * 100) / 100,
      },
    });
  } catch (error) {
    console.error(" Error saving answer:", error);

    res.status(500).json({
      success: false,
      message:"Failed to save answer",
      error: error.message,
    });
  }
};

//  Helper function to prepare results object
const calculateDetailedResults = (attempt, testSeries, allAttemptsCount) => {
  const questionAnalysis = testSeries.questions.map((question, index) => {
    const userAnswer = attempt.answers.find(ans => ans.questionId.toString() === question._id.toString());
    const correctOption = question.options.findIndex(opt => opt.isCorrect);

    return {
      questionNumber: index + 1,
      questionText: question.questionText,
      options: question.options.map((opt, optIndex) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        selected: userAnswer && userAnswer.selectedOption === optIndex
      })),
      userAnswer: userAnswer ? userAnswer.selectedOption : null,
      correctAnswer: correctOption,
      isCorrect: userAnswer ? userAnswer.isCorrect : false,
      marks: question.marks,
      marksObtained: userAnswer ? userAnswer.marksObtained : 0,
      explanation: question.explanation ||'',
      difficulty: question.difficulty,
      subject: question.subject,
      topic: question.topic
    };
  });

  return {
    attemptId: attempt._id,
    testSeries: {
      id: testSeries._id,
      title: testSeries.title,
      duration: testSeries.duration,
      totalMarks: testSeries.totalMarks
    },
    student: {
      name: attempt.user?.name ||'',
      email: attempt.user?.email ||''
    },
    performance: {
      totalScore: attempt.totalScore,
      maxScore: testSeries.totalMarks,
      percentage: Math.round(attempt.percentage * 100) / 100,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      unanswered: attempt.unanswered,
      totalQuestions: testSeries.questions.length,
      timeTaken: attempt.timeSpent,
      rank: attempt.rank || 0,
      totalAttempts: allAttemptsCount
    },
    timing: {
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      duration: attempt.timeSpent
    },
    grade: getGrade(attempt.percentage),
    questionAnalysis,
    submittedAt: attempt.endTime
  };
};

// SUBMIT TEST - Finalize Test Attempt
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeTaken, studentId } = req.body;

    console.log(" Submitting test:", { attemptId, timeTaken });

    const attempt = await TestAttempt.findById(attemptId).populate("testSeries").populate("user","name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:"Test attempt not found",
      });
    }

    if (attempt.status ==="completed") {
      return res.status(400).json({
        success: false,
        message:"Test already submitted",
      });
    }

    const testSeries = attempt.testSeries;

    // ----------------------------------------------------
    // FINALIZE ATTEMPT
    // ----------------------------------------------------

    const now = new Date();

    // If timer expired earlier, keep original endTime
    const finalEndTime = attempt.endTime && attempt.endTime < now ? attempt.endTime : now;

    attempt.endTime = finalEndTime;

    // Ensure we have Date objects for calculation
    const startTimeDate = new Date(attempt.startTime);
    const endTimeDate = new Date(finalEndTime);

    // Calculate duration in seconds
    const calculatedDuration = Math.max(0, Math.floor((endTimeDate.getTime() - startTimeDate.getTime()) / 1000));

    // Use client-provided time if valid (> 0), otherwise use calculated duration
    attempt.timeSpent = (timeTaken && timeTaken > 0) ? timeTaken : calculatedDuration;

    attempt.status ="completed";
    attempt.isSubmitted = true;

    // ----------------------------------------------------
    // CALCULATE FINAL PERCENTAGE
    // ----------------------------------------------------

    if (testSeries.totalMarks > 0) {
      attempt.percentage = Math.max(
        0,
        (attempt.totalScore / testSeries.totalMarks) * 100
      );
    }

    await attempt.save();

    // ----------------------------------------------------
    // UPDATE PURCHASE RECORD (PAID TEST)
    // ----------------------------------------------------

    if (testSeries.isPaid && studentId) {
      try {
        const purchase = await TestSeriesPurchase.findOne({
          student_id: studentId,
          test_series_id: testSeries._id,
"purchase_details.payment_status":"completed",
"purchase_details.access_granted": true,
        }).sort({"purchase_details.purchase_date": -1 });

        if (purchase) {
          purchase.attempt_details.total_attempts =
            (purchase.attempt_details.total_attempts || 0) + 1;

          purchase.attempt_details.last_attempt_date = new Date();

          purchase.attempt_details.total_time_spent =
            (purchase.attempt_details.total_time_spent || 0) + attempt.timeSpent;

          if (attempt.percentage > purchase.attempt_details.best_percentage) {
            purchase.attempt_details.best_percentage = attempt.percentage;
            purchase.attempt_details.best_score = attempt.totalScore;
          } else if (purchase.attempt_details.completion_status ==="not_started") {
            purchase.attempt_details.completion_status ="in_progress";
          }

          await purchase.save();
        }
      } catch (err) {
        console.warn(" Failed to update purchase record:", err.message);
      }
    }

    // ----------------------------------------------------
    // CALCULATE RANK
    // ----------------------------------------------------

    const allAttemptsCount = await TestAttempt.countDocuments({
      testSeries: testSeries._id,
      status:"completed",
    });

    const allAttempts = await TestAttempt.find({
      testSeries: testSeries._id,
      status:"completed",
    }).sort({ totalScore: -1, timeSpent: 1 });

    const rank =
      allAttempts.findIndex(
        (att) => att._id.toString() === attempt._id.toString()
      ) + 1;

    attempt.rank = rank;

    await attempt.save();

    //  REFRESH STUDENT METRICS 
    try {
      const StudentMetrics = require('../Models/StudentMetricsModel');
      await StudentMetrics.refreshAll(attempt.user._id || attempt.user);
      console.log(" Student metrics refreshed after test submission");
    } catch (metricsErr) {
      console.error(" Failed to refresh metrics:", metricsErr.message);
    }

    //  SEND SUCCESS NOTIFICATION TO STUDENT
    try {
      const Notification = require('../Models/NotificationModel');
      const userId = attempt.user._id ? attempt.user._id.toString() : attempt.user.toString();
      await Notification.create({
        recipient: userId,
        recipientModel: 'User',
        sender: null,
        senderModel: 'Admin',
        senderName: 'EduDocs Team',
        type: 'general',
        title: 'Test Submitted Successfully!',
        message: `You have successfully submitted your attempt for the test "${testSeries.title}". Score: ${attempt.totalScore}/${testSeries.totalMarks} (${Math.round(attempt.percentage * 100) / 100}%).`,
        referenceId: attempt._id
      });
      console.log("Notification triggered for student on test submission");
    } catch (notifErr) {
      console.error("Failed to trigger test submission notification:", notifErr.message);
    }

    console.log(" Test submitted successfully:", {
      attemptId,
      score: attempt.totalScore,
      percentage: attempt.percentage,
      rank,
    });

    // ----------------------------------------------------
    // PREPARE RESULTS
    // ----------------------------------------------------

    const results = calculateDetailedResults(attempt, testSeries, allAttemptsCount);

    return res.json({
      success: true,
      message:"Test submitted successfully!",
      results,
    });
  } catch (error) {
    console.error(" Error submitting test:", error);

    return res.status(500).json({
      success: false,
      message:"Failed to submit test",
      error: error.message,
    });
  }
};

//  GET TEST RESULTS
const getTestResults = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('testSeries','title duration totalMarks questions maxAttempts')
      .populate('user','name email');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:'Test attempt not found'
      });
    }

    if (attempt.status !=='completed' && attempt.status !=='submitted') {
      return res.status(400).json({
        success: false,
        message:'Test not yet completed'
      });
    }

    // Get all attempts count for ranking
    const allAttemptsCount = await TestAttempt.countDocuments({
      testSeries: attempt.testSeries._id,
      status:'completed'
    });

    const results = calculateDetailedResults(attempt, attempt.testSeries, allAttemptsCount);

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error(' Error getting test results:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get test results',
      error: error.message
    });
  }
};

//  Helper function to determine grade
const getGrade = (percentage) => {
  if (percentage >= 90) return { grade:'A+', description:'Outstanding' };
  if (percentage >= 80) return { grade:'A', description:'Excellent' };
  if (percentage >= 70) return { grade:'B+', description:'Very Good' };
  if (percentage >= 60) return { grade:'B', description:'Good' };
  if (percentage >= 50) return { grade:'C', description:'Average' };
  if (percentage >= 40) return { grade:'D', description:'Below Average' };
  return { grade:'F', description:'Needs Improvement' };
};

module.exports = {
  startTest,
  submitAnswer,
  submitTest,
  getTestResults
};
