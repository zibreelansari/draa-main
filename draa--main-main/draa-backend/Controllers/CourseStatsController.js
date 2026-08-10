const CourseModel = require('../Models/CourseModel');

const getCourseStats = async (req, res) => {
    try {
        // Optimized: Single aggregation for all stats
        const statsAggregation = await CourseModel.aggregate([
            {
                $facet: {
                    counts: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                approved: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ["$isApproved", false] }, 1, 0] } },
                                published: { $sum: { $cond: [{ $eq: ["$status","published"] }, 1, 0] } },
                                draft: { $sum: { $cond: [{ $eq: ["$status","draft"] }, 1, 0] } },
                                archived: { $sum: { $cond: [{ $eq: ["$status","archived"] }, 1, 0] } },
                                totalRevenue: { $sum:"$price" },
                                totalEnrollments: { $sum:"$enrolled_count" } // Fixed field name
                            }
                        }
                    ]
                }
            }
        ]);

        const results = statsAggregation[0].counts[0] || {
            total: 0, approved: 0, pending: 0, published: 0, draft: 0, archived: 0, totalRevenue: 0, totalEnrollments: 0
        };

        res.status(200).json({
            success: true,
            stats: {
                total: results.total,
                approved: results.approved,
                pending: results.pending,
                published: results.published,
                draft: results.draft,
                archived: results.archived,
                totalRevenue: results.totalRevenue,
                totalEnrollments: results.totalEnrollments
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch statistics'
        });
    }
};

module.exports = getCourseStats;
