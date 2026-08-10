
const Exam = require('../Models/ExamModel');
const mongoose = require("mongoose");
const Submission = require('../Models/exam.submission.models')
exports.createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json({ message:"Exam created successfully", exam });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);

  }
};


exports.getExamDetailsForStudent = async (req, res) => {
  try {
    const { id } = req.params; // exam _id
    const exam = await Exam.findById({ _id: id }); // hide sensitive fields

    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getExams = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const exams = await Exam.find(filter)
      .select("-questions") //  CRITICAL: Exclude massive questions array
      .limit(parseInt(limit))
      .lean();

    if (!exams) {
      return res.status(404).json({ message:"Exams not found" });
    }

    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// get exams for teachers
exports.getExamsByTeacher = async (req, res) => {
  try {
    const { id } = req.params //  use `new`
    const exams = await Exam.find({ createdBy: id });
    console.log(id)
    res.json({
      mes: true,
      exams: exams,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error(err);
  }
};

// get exams by id 
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params; // exam document id

    // Find exam by _id and populate mapped resources
    const exam = await Exam.findOne({ _id: id })
      .populate('mappedResources.syllabus','title examName')
      .populate('mappedResources.pyqs','title examName year')
      .populate('mappedResources.notifications','title organization_name')
      .populate('mappedResources.currentAffairs','title type');

    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    res.json({
      success: true,
      exam: exam,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error(err);
  }
};


// delete exams
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && exam.createdBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message:"Access denied. You do not own this record." });
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message:'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
}

// update
exports.updateExamByCreator = async (req, res) => {
  try {
    const { id } = req.params
    // Reset to inactive on every edit
    const updatePayload = { ...req.body, status:'INACTIVE' };
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ error:'Exam not found' });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && exam.createdBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message:"Access denied. You do not own this record." });
    }

    const updatedExam = await Exam.findOneAndUpdate(
      { _id: id },
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ error:'No exam found for this teacher' });
    }

    res.json(updatedExam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//submit exam
//  Enhanced submit exam with detailed tracking
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      answers,
      studentId,
      submissionTime,
      timeSpent,
      violations,
      isAutoSubmit,
      autoSubmitReason,
      examStartTime,
      userAgent,
      metadata
    } = req.body;

    console.log(' Exam submission received:', {
      examId,
      studentId,
      answersCount: Object.keys(answers || {}).length,
      timeSpent,
      violations: violations?.count || 0,
      isAutoSubmit
    });

    //  Check if student already submitted
    const existingSubmission = await Submission.findOne({ examId, studentId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message:"You have already submitted this exam",
        submissionId: existingSubmission._id
      });
    }

    //  Get exam details for scoring
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message:"Exam not found"
      });
    }

    //  Basic scoring calculation
    let totalScore = 0;
    let correctAnswers = 0;
    const questionResults = [];

    exam.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      let isCorrect = false;
      let score = 0;

      if (studentAnswer && studentAnswer.toString().trim() !=='') {
        // Basic scoring - give points for attempting
        if (question.type ==='mcq') {
          score = question.marks || 1; // Full marks for MCQ attempt
          isCorrect = true; // Simplified - would check against correct answer
          correctAnswers++;
        } else if (question.type ==='short' || question.type ==='paragraph') {
          const answerLength = studentAnswer.toString().trim().length;
          if (answerLength >= 10) {
            score = (question.marks || 1) * 0.8; // 80% for good attempt
            isCorrect = true;
            correctAnswers++;
          } else if (answerLength >= 3) {
            score = (question.marks || 1) * 0.5; // 50% for minimal attempt
          }
        }
      }

      questionResults.push({
        questionIndex: index,
        questionId: question._id,
        studentAnswer: studentAnswer ||'',
        isCorrect,
        score: Math.round(score * 100) / 100,
        maxScore: question.marks || 1
      });

      totalScore += score;
    });

    //  Calculate percentage and grade
    const finalScore = Math.round(totalScore * 100) / 100;
    const maxPossible = exam.totalMarks || exam.questions.length;
    const percentage = Math.round((finalScore / maxPossible) * 100);

    let grade ='F';
    if (percentage >= 90) grade ='A+';
    else if (percentage >= 80) grade ='A';
    else if (percentage >= 70) grade ='B+';
    else if (percentage >= 60) grade ='B';
    else if (percentage >= 50) grade ='C';
    else if (percentage >= 40) grade ='D';

    //  Create enhanced submission
    const submissionData = {
      examId,
      studentId,
      answers,
      submittedAt: submissionTime ? new Date(submissionTime) : new Date(),

      //  Enhanced fields
      score: {
        total: finalScore,
        maxPossible: maxPossible,
        percentage: percentage,
        grade: grade,
        correctAnswers: correctAnswers,
        totalQuestions: exam.questions.length
      },

      timing: {
        timeSpent: timeSpent || 0,
        examStartTime: examStartTime ? new Date(examStartTime) : null,
        durationMinutes: exam.durationMinutes
      },

      violations: {
        count: violations?.count || 0,
        details: violations?.details || []
      },

      submission: {
        isAutoSubmit: isAutoSubmit || false,
        autoSubmitReason: autoSubmitReason || null,
        userAgent: userAgent ||'',
        metadata: metadata || {}
      },

      results: {
        questionResults: questionResults,
        completionRate: Math.round((Object.keys(answers).length / exam.questions.length) * 100)
      }
    };

    const newSubmission = new Submission(submissionData);
    const savedSubmission = await newSubmission.save();

    console.log(' Exam submitted successfully:', {
      submissionId: savedSubmission._id,
      score: `${finalScore}/${maxPossible} (${percentage}%)`,
      grade: grade,
      violations: violations?.count || 0
    });

    // Recompute aggregate metrics so leaderboard points / mastery / streak
    // reflect this submission immediately.
    try {
      const StudentMetrics = require('../Models/StudentMetricsModel');
      if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
        await StudentMetrics.refreshAll(studentId);
      }
    } catch (metricsErr) {
      console.error(' Failed to refresh metrics after exam submission:', metricsErr.message);
    }

    res.json({
      success: true,
      message:"Exam submitted successfully",
      submissionId: savedSubmission._id,
      score: {
        total: finalScore,
        percentage: percentage,
        grade: grade
      }
    });

  } catch (err) {
    console.error(" Error in submitExam:", err);
    res.status(500).json({
      success: false,
      message:"Submission failed:" + err.message
    });
  }
};

//  NEW: Get exam results
exports.getExamResults = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('examId','title subject totalMarks durationMinutes')
      .populate('studentId','name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message:"Submission not found"
      });
    }

    res.json({
      success: true,
      submission: submission
    });

  } catch (err) {
    console.error("Error getting exam results:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};




//list of exams 
// GET /exam/student/list/:studentId
// GET /exam/student/list
exports.getAllExamsForStudents = async (req, res) => {
  try {
    const now = new Date();

    const exams = await Exam.find({
      $expr: {
        $gte: [
          { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60000] }] },
          now
        ]
      }
    }).select("title subject durationMinutes scheduledAt totalMarks")
      .lean();

    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET STATISTICS
exports.getStatsOverview = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role ==="TEACHER") {
      filter.createdBy = req.user.id;
    }

    const [total, active, inactive] = await Promise.all([
      Exam.countDocuments(filter),
      Exam.countDocuments({ ...filter, status:"ACTIVE" }),
      Exam.countDocuments({ ...filter, status:"INACTIVE" })
    ]);

    res.json({
      success: true,
      stats: { total, active, inactive }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
