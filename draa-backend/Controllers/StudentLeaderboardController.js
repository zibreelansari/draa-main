const mongoose = require('mongoose');
const StudentMetrics = require('../Models/StudentMetricsModel');
const User = require('../Models/UserModel');

// Get overall leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit ='20', type ='all' } = req.query;
    const limitNum = Math.min(parseInt(limit), 100);

    let query = {};

    // Filter by type
    if (type === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query['metadata.lastUpdated'] = { $gte: weekAgo };
    } else if (type === 'monthly') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query['metadata.lastUpdated'] = { $gte: monthAgo };
    }

    // Filter out students who have disabled showRanking in settings
    const hiddenUsers = await User.find({
      'settings.privacy.showRanking': false
    }).select('_id');
    const hiddenUserIds = hiddenUsers.map(u => u._id);
    
    query.studentId = { $nin: hiddenUserIds };

    const leaderboard = await StudentMetrics.find(query)
      .sort({'achievements.totalPoints': -1,'achievements.streak.current': -1 })
      .limit(limitNum)
      .populate('studentId','name email avatar phn Status');

    const data = leaderboard.map((metrics, index) => ({
      rank: index + 1,
      studentId: metrics.studentId?._id,
      name: metrics.studentId?.name ||'Anonymous',
      email: metrics.studentId?.email,
      avatar: metrics.studentId?.avatar,
      phone: metrics.studentId?.phn,
      status: metrics.studentId?.Status,
      points: metrics.achievements.totalPoints,
      level: metrics.achievements.level,
      streak: metrics.achievements.streak.current,
      longestStreak: metrics.achievements.streak.longest,
      badges: metrics.achievements.badges,
      certificates: metrics.achievements.certificates,
      avgScore: metrics.academic?.averageScore || 0,
      coursesCompleted: metrics.courses?.completed || 0,
      examsPassed: metrics.academic?.examsPassed || 0,
      isTopThree: index < 3
    }));

    res.json({
      success: true,
      data,
      count: data.length,
      type
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

// Get student's rank
exports.getStudentRank = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid student ID'
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

    // Count students with more points who are not hidden
    const higherRanked = await StudentMetrics.countDocuments({
      studentId: { $nin: hiddenUserIds },
      'achievements.totalPoints': { $gt: metrics.achievements.totalPoints }
    });

    const totalStudents = await StudentMetrics.countDocuments({
      studentId: { $nin: hiddenUserIds }
    });
    const rank = higherRanked + 1;

    // Update rank in metrics
    metrics.achievements.rank = rank;
    await metrics.save();

    // Get surrounding students (prev and next ranks)
    const prevStudent = await StudentMetrics.findOne({
'achievements.totalPoints': { $gt: metrics.achievements.totalPoints }
      })
      .sort({'achievements.totalPoints': 1 })
      .populate('studentId','name avatar');

    const nextStudent = await StudentMetrics.findOne({
'achievements.totalPoints': { $lt: metrics.achievements.totalPoints, $gt: 0 }
      })
      .sort({'achievements.totalPoints': -1 })
      .populate('studentId','name avatar');

    res.json({
      success: true,
      data: {
        rank,
        totalStudents,
        percentile: totalStudents > 0 ? Math.round(((totalStudents - rank) / totalStudents) * 100) : 0,
        points: metrics.achievements.totalPoints,
        level: metrics.achievements.level,
        streak: metrics.achievements.streak.current,
        prevRank: prevStudent ? (await StudentMetrics.countDocuments({
'achievements.totalPoints': { $gt: prevStudent.achievements.totalPoints }
        }) + 1) : null,
        prevStudent: prevStudent ? {
          name: prevStudent.studentId?.name,
          avatar: prevStudent.studentId?.avatar,
          points: prevStudent.achievements.totalPoints
        } : null,
        nextRank: nextStudent ? rank + 1 : null,
        nextStudent: nextStudent ? {
          name: nextStudent.studentId?.name,
          avatar: nextStudent.studentId?.avatar,
          points: nextStudent.achievements.totalPoints
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting student rank:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get student rank',
      error: error.message
    });
  }
};

// Get top performers by category
exports.getTopByCategory = async (req, res) => {
  try {
    const { category ='points' } = req.query;

    let sortField;
    switch (category) {
      case'streak':
        sortField = {'achievements.streak.current': -1 };
        break;
      case'courses':
        sortField = {'courses.completed': -1 };
        break;
      case'exams':
        sortField = {'academic.examsPassed': -1 };
        break;
      case'scores':
        sortField = {'academic.averageScore': -1 };
        break;
      default:
        sortField = {'achievements.totalPoints': -1 };
    }

    // Filter out students who have disabled showRanking in settings
    const hiddenUsers = await User.find({
      'settings.privacy.showRanking': false
    }).select('_id');
    const hiddenUserIds = hiddenUsers.map(u => u._id);

    const topPerformers = await StudentMetrics.find({
      studentId: { $nin: hiddenUserIds }
    })
      .sort(sortField)
      .limit(10)
      .populate('studentId','name avatar email');

    const data = topPerformers.map((metrics, index) => {
      let value;
      switch (category) {
        case'streak':
          value = metrics.achievements.streak.current;
          break;
        case'courses':
          value = metrics.courses?.completed || 0;
          break;
        case'exams':
          value = metrics.academic?.examsPassed || 0;
          break;
        case'scores':
          value = metrics.academic?.averageScore || 0;
          break;
        default:
          value = metrics.achievements.totalPoints;
      }

      return {
        rank: index + 1,
        studentId: metrics.studentId?._id,
        name: metrics.studentId?.name ||'Anonymous',
        avatar: metrics.studentId?.avatar,
        value,
        category
      };
    });

    res.json({
      success: true,
      data,
      category
    });

  } catch (error) {
    console.error('Error getting top by category:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get top performers',
      error: error.message
    });
  }
};

// Get student's friends comparison (mock for now - would need friends feature)
exports.getFriendsComparison = async (req, res) => {
  try {
    const { studentId } = req.params;

    // For now, return random comparison data
    // In production, this would compare with actual friends
    const myMetrics = await StudentMetrics.findOne({ studentId });

    if (!myMetrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    // Get 5 random students for comparison
    const randomStudents = await StudentMetrics.aggregate([
      { $match: { studentId: { $ne: new mongoose.Types.ObjectId(studentId) } } },
      { $sample: { size: 5 } },
      {
        $lookup: {
          from:'users',
          localField:'studentId',
          foreignField:'_id',
          as:'user'
        }
      },
      { $unwind:'$user' }
    ]);

    const comparison = randomStudents.map(s => ({
      name: s.user.name,
      avatar: s.user.avatar,
      points: s.achievements.totalPoints,
      streak: s.achievements.streak.current,
      avgScore: s.academic?.averageScore || 0,
      courses: s.courses?.completed || 0
    }));

    res.json({
      success: true,
      data: {
        myPoints: myMetrics.achievements.totalPoints,
        myStreak: myMetrics.achievements.streak.current,
        myAvgScore: myMetrics.academic?.averageScore || 0,
        myCourses: myMetrics.courses?.completed || 0,
        comparison
      }
    });

  } catch (error) {
    console.error('Error getting friends comparison:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get comparison',
      error: error.message
    });
  }
};

// Get badges/achievements
exports.getAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid student ID'
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    // Define all possible badges
    const allBadges = [
      { id:'first_course', name:'First Step', icon:'', description:'Enroll in first course', condition: (m) => m.courses?.totalEnrolled >= 1 },
      { id:'bookworm', name:'Bookworm', icon:'', description:'Read 5 books', condition: (m) => m.books?.readBooks >= 5 },
      { id:'streak_7', name:'Week Warrior', icon:'', description:'7 day streak', condition: (m) => m.achievements?.streak?.current >= 7 },
      { id:'streak_30', name:'Month Master', icon:'', description:'30 day streak', condition: (m) => m.achievements?.streak?.current >= 30 },
      { id:'examAce', name:'Exam Ace', icon:'', description:'Pass 10 exams', condition: (m) => m.academic?.examsPassed >= 10 },
      { id:'highScorer', name:'High Scorer', icon:'', description:'Score 90%+', condition: (m) => m.academic?.highestScore >= 90 },
      { id:'perfectionist', name:'Perfectionist', icon:'', description:'Complete 5 courses', condition: (m) => m.courses?.completed >= 5 },
      { id:'testMaster', name:'Test Master', icon:'', description:'Attempt 20 tests', condition: (m) => m.testSeries?.attempted >= 20 },
      { id:'earlyBird', name:'Early Bird', icon:'', description:'Study before 7 AM', condition: (m) => m.activity?.preferredStudyTime ==='morning' },
      { id:'nightOwl', name:'Night Owl', icon:'', description:'Study after 10 PM', condition: (m) => m.activity?.preferredStudyTime ==='night' },
      { id:'pointMaster', name:'Point Master', icon:'', description:'Earn 1000 points', condition: (m) => m.achievements?.totalPoints >= 1000 },
      { id:'levelUp', name:'Level Up', icon:'', description:'Reach level 5', condition: (m) => m.achievements?.level >= 5 }
    ];

    const earnedBadges = [];
    const availableBadges = [];

    allBadges.forEach(badge => {
      const isEarned = metrics.achievements.recentBadges?.some(b => b.id === badge.id);

      if (isEarned) {
        const badgeData = metrics.achievements.recentBadges.find(b => b.id === badge.id);
        earnedBadges.push({
          ...badge,
          earnedAt: badgeData?.earnedAt
        });
      } else if (badge.condition(metrics)) {
        // Already qualified but not recorded
        earnedBadges.push({
          ...badge,
          earnedAt: new Date()
        });
      } else {
        availableBadges.push(badge);
      }
    });

    res.json({
      success: true,
      data: {
        earned: earnedBadges,
        available: availableBadges,
        totalEarned: earnedBadges.length,
        totalBadges: allBadges.length,
        nextBadge: availableBadges[0] || null,
        points: metrics.achievements.totalPoints,
        level: metrics.achievements.level,
        levelProgress: (metrics.achievements.totalPoints % 100),
        pointsToNextLevel: 100 - (metrics.achievements.totalPoints % 100)
      }
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get achievements',
      error: error.message
    });
  }
};

// Award badge to student
exports.awardBadge = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { badgeId, badgeName, badgeIcon } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid student ID'
      });
    }

    const metrics = await StudentMetrics.findOne({ studentId });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message:'Student metrics not found'
      });
    }

    // Check if badge already exists
    const alreadyHas = metrics.achievements.recentBadges?.some(b => b.id === badgeId);
    if (alreadyHas) {
      return res.json({
        success: true,
        message:'Badge already earned',
        data: metrics.achievements.recentBadges
      });
    }

    // Add badge
    if (!metrics.achievements.recentBadges) {
      metrics.achievements.recentBadges = [];
    }

    metrics.achievements.recentBadges.push({
      id: badgeId,
      name: badgeName,
      icon: badgeIcon,
      earnedAt: new Date()
    });

    metrics.achievements.badges = metrics.achievements.recentBadges.length;
    metrics.achievements.totalPoints += 50; // Badge bonus points

    await metrics.save();

    res.json({
      success: true,
      message:'Badge awarded successfully',
      data: {
        badge: { id: badgeId, name: badgeName, icon: badgeIcon },
        totalBadges: metrics.achievements.badges,
        totalPoints: metrics.achievements.totalPoints
      }
    });

  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message:'Failed to award badge',
      error: error.message
    });
  }
};