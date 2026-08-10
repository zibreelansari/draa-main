const mongoose = require('mongoose');
const TeacherModel = require('../Models/TeacherModel');

// Get Teacher Statistics Overview
const getTeacherStatsOverview = async (req, res) => {
    try {
        console.log('Fetching teacher statistics overview...');

        // Get basic counts using aggregation
        const statsAggregation = await TeacherModel.aggregate([
            {
                $group: {
                    _id:'$Status',
                    count: { $sum: 1 },
                    avgRating: { $avg:'$trating' },
                    avgExperience: { $avg:'$texp' },
                    totalCourses: { $sum:'$coursesCount' },
                    totalStudents: { $sum:'$studentsCount' }
                }
            }
        ]);

        // Get total count
        const totalCount = await TeacherModel.countDocuments();

        // Initialize stats object with defaults
        const stats = {
            total: totalCount,
            approved: 0,
            pending: 0,
            rejected: 0,
            suspended: 0,
            avgRating: 0,
            avgExperience: 0,
            totalCourses: 0,
            totalStudents: 0,
            recentRegistrations: 0,
            topSpecializations: [],
            growthMetrics: {
                thisMonth: 0,
                lastMonth: 0,
                growthRate: 0
            }
        };

        // Process aggregation results
        let totalRatingSum = 0;
        let ratedTeachersCount = 0;
        let totalExperienceSum = 0;

        statsAggregation.forEach(item => {
            const status = item._id;
            const count = item.count;

            // Set status counts
            if (status ==='approved') stats.approved = count;
            else if (status ==='pending') stats.pending = count;
            else if (status ==='rejected') stats.rejected = count;
            else if (status ==='suspended') stats.suspended = count;

            // Accumulate totals
            if (item.avgRating > 0) {
                totalRatingSum += item.avgRating * count;
                ratedTeachersCount += count;
            }
            totalExperienceSum += item.avgExperience * count;
            stats.totalCourses += item.totalCourses || 0;
            stats.totalStudents += item.totalStudents || 0;
        });

        // Calculate averages
        if (ratedTeachersCount > 0) {
            stats.avgRating = totalRatingSum / ratedTeachersCount;
        }
        if (totalCount > 0) {
            stats.avgExperience = totalExperienceSum / totalCount;
        }

        // Get top specializations
        const specializationStats = await TeacherModel.aggregate([
            {
                $match: {
                    tspecialization: { $exists: true, $nin: [null,''] }
                }
            },
            {
                $group: {
                    _id:'$tspecialization',
                    count: { $sum: 1 },
                    avgRating: { $avg:'$trating' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        stats.topSpecializations = specializationStats.map(item => ({
            specialization: item._id,
            count: item.count,
            avgRating: item.avgRating || 0
        }));

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRegistrations = await TeacherModel.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        stats.recentRegistrations = recentRegistrations;

        // Get growth metrics (this month vs last month)
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [thisMonthCount, lastMonthCount] = await Promise.all([
            TeacherModel.countDocuments({
                createdAt: { $gte: startOfThisMonth }
            }),
            TeacherModel.countDocuments({
                createdAt: { 
                    $gte: startOfLastMonth,
                    $lte: endOfLastMonth
                }
            })
        ]);

        stats.growthMetrics = {
            thisMonth: thisMonthCount,
            lastMonth: lastMonthCount,
            growthRate: lastMonthCount > 0 
                ? ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(1)
                : thisMonthCount > 0 ? 100 : 0
        };

        console.log('Teacher statistics calculated successfully:', stats);

        res.status(200).json({
            success: true,
            message:'Teacher statistics fetched successfully',
            stats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching teacher statistics:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch teacher statistics',
            error: process.env.NODE_ENV ==='development' ? error.message : undefined
        });
    }
};

// Get Detailed Teacher Analytics
const getDetailedAnalytics = async (req, res) => {
    try {
        const { period ='30d' } = req.query; // 7d, 30d, 90d, 1y

        // Calculate date range based on period
        const now = new Date();
        let startDate;
        
        switch (period) {
            case'7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case'90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case'1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Registration trends
        const registrationTrends = await TeacherModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year:'$createdAt' },
                        month: { $month:'$createdAt' },
                        day: { $dayOfMonth:'$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {'_id.year': 1,'_id.month': 1,'_id.day': 1 }
            }
        ]);

        // Status distribution over time
        const statusTrends = await TeacherModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        status:'$Status',
                        date: {
                            $dateToString: {
                                format:'%Y-%m-%d',
                                date:'$createdAt'
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // City-wise distribution
        const cityDistribution = await TeacherModel.aggregate([
            {
                $match: {
                    tcity: { $exists: true, $nin: [null,''] }
                }
            },
            {
                $group: {
                    _id:'$tcity',
                    count: { $sum: 1 },
                    approvedCount: {
                        $sum: { $cond: [{ $eq: ['$Status','approved'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Experience distribution
        const experienceDistribution = await TeacherModel.aggregate([
            {
                $bucket: {
                    groupBy:'$texp',
                    boundaries: [0, 2, 5, 10, 20, 100],
                    default:'Other',
                    output: {
                        count: { $sum: 1 },
                        avgRating: { $avg:'$trating' }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message:'Detailed analytics fetched successfully',
            data: {
                period: period,
                dateRange: {
                    start: startDate.toISOString(),
                    end: now.toISOString()
                },
                registrationTrends: registrationTrends,
                statusTrends: statusTrends,
                cityDistribution: cityDistribution,
                experienceDistribution: experienceDistribution
            }
        });

    } catch (error) {
        console.error('Error fetching detailed analytics:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch detailed analytics',
            error: process.env.NODE_ENV ==='development' ? error.message : undefined
        });
    }
};

// Get Performance Metrics
const getPerformanceMetrics = async (req, res) => {
    try {
        // Top rated teachers
        const topRatedTeachers = await TeacherModel.find({
            Status:'approved',
            trating: { $gte: 4.0 }
        })
        .select('tname temail tspecialization trating coursesCount studentsCount')
        .sort({ trating: -1, studentsCount: -1 })
        .limit(10);

        // Most experienced teachers
        const mostExperiencedTeachers = await TeacherModel.find({
            Status:'approved'
        })
        .select('tname temail tspecialization texp trating coursesCount')
        .sort({ texp: -1, trating: -1 })
        .limit(10);

        // Teachers with most students
        const mostPopularTeachers = await TeacherModel.find({
            Status:'approved',
            studentsCount: { $gt: 0 }
        })
        .select('tname temail tspecialization studentsCount coursesCount trating')
        .sort({ studentsCount: -1, trating: -1 })
        .limit(10);

        // Performance by specialization
        const specializationPerformance = await TeacherModel.aggregate([
            {
                $match: {
                    Status:'approved',
                    tspecialization: { $exists: true, $nin: [null,''] }
                }
            },
            {
                $group: {
                    _id:'$tspecialization',
                    count: { $sum: 1 },
                    avgRating: { $avg:'$trating' },
                    avgExperience: { $avg:'$texp' },
                    totalStudents: { $sum:'$studentsCount' },
                    totalCourses: { $sum:'$coursesCount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            message:'Performance metrics fetched successfully',
            data: {
                topRatedTeachers: topRatedTeachers,
                mostExperiencedTeachers: mostExperiencedTeachers,
                mostPopularTeachers: mostPopularTeachers,
                specializationPerformance: specializationPerformance
            }
        });

    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch performance metrics',
            error: process.env.NODE_ENV ==='development' ? error.message : undefined
        });
    }
};

module.exports = {
    getTeacherStatsOverview,
    getDetailedAnalytics,
    getPerformanceMetrics
};
