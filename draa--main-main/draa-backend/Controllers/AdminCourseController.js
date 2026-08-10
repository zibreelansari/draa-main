// Controllers/AdminCourseController.js
const CourseModel = require('../Models/CourseModel');
const { checkCoursePurchases } = require('../utils/purchaseCheck');

// Get all courses for admin with filtering, pagination, and search
const getAllCoursesAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search ='',
            status ='',
            isApproved ='',
            skill_level ='',
            language ='',
            course_category ='',
            sortBy ='createdAt',
            sortOrder ='desc',
            teacher_id =''
        } = req.query;

        // Build filter object
        const filter = {};

        // Search functionality
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options:'i' } },
                { short_desc: { $regex: search, $options:'i' } },
                { course_category: { $regex: search, $options:'i' } }
            ];
        }

        // Status filter
        if (status) filter.status = status;

        // Approval filter
        if (isApproved !=='') filter.isApproved = isApproved ==='true';

        // Skill level filter
        if (skill_level) filter.skill_level = skill_level;

        // Language filter
        if (language) filter.language = { $regex: language, $options:'i' };

        // Category filter
        if (course_category) filter.course_category = { $regex: course_category, $options:'i' };

        // Teacher filter
        if (teacher_id) filter.teacher_id = teacher_id;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder ==='desc' ? -1 : 1;

        // Calculate pagination
        const parsedLimit = parseInt(limit);
        const skip = parsedLimit === 0 ? 0 : (parseInt(page) - 1) * parsedLimit;

        // Fetch courses
        let queryObj = CourseModel.find(filter)
            .populate('teacher_id','tname temail tprofile tspecialization')
            .populate('approvedBy','aname aemail')
            .populate('rejectedBy','aname aemail')
            .sort(sort);

        if (parsedLimit > 0) {
            queryObj = queryObj.skip(skip).limit(parsedLimit);
        }

        const courses = await queryObj;

        // Get total count
        const totalCourses = await CourseModel.countDocuments(filter);
        const totalPages = parsedLimit === 0 ? 1 : Math.ceil(totalCourses / parsedLimit);

        res.status(200).json({
            success: true,
            data: {
                courses,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCourses,
                    hasNextPage: parsedLimit === 0 ? false : parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin courses:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch courses',
            error: error.message
        });
    }
};

// Approve course
const approveCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin?.id; // Assuming admin ID from middleware

        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message:'Course not found'
            });
        }

        // Use the model's approve method
        await course.approve(adminId);

        res.status(200).json({
            success: true,
            message:'Course approved successfully',
            course: await CourseModel.findById(id)
                .populate('teacher_id','tname temail')
                .populate('approvedBy','aname aemail')
        });
    } catch (error) {
        console.error('Error approving course:', error);
        res.status(500).json({
            success: false,
            message:'Failed to approve course',
            error: error.message
        });
    }
};

// Reject course
const rejectCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.admin?.id; // Assuming admin ID from middleware

        if (!reason) {
            return res.status(400).json({
                success: false,
                message:'Rejection reason is required'
            });
        }

        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message:'Course not found'
            });
        }

        // Use the model's reject method
        await course.reject(adminId, reason);

        res.status(200).json({
            success: true,
            message:'Course rejected successfully',
            course: await CourseModel.findById(id)
                .populate('teacher_id','tname temail')
                .populate('rejectedBy','aname aemail')
        });
    } catch (error) {
        console.error('Error rejecting course:', error);
        res.status(500).json({
            success: false,
            message:'Failed to reject course',
            error: error.message
        });
    }
};

// Update course status
const updateCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['draft','pending','published','archived','suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid statuses are: ${validStatuses.join(',')}`
            });
        }

        // Check if course exists
        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message:'Course not found'
            });
        }

        // Block deactivation/suspension/archive if course has purchases
        const deactivating = ['archived','suspended'].includes(status);
        if (deactivating) {
            const { canDelete, purchaseCount, message } = await checkCoursePurchases(id);
            if (!canDelete) {
                return res.status(400).json({
                    success: false,
                    message: message
                });
            }
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            {
                status,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('teacher_id','tname temail tspecialization');

        res.status(200).json({
            success: true,
            message: `Course status updated to ${status}`,
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error updating course status:', error);
        res.status(500).json({
            success: false,
            message:'Failed to update course status',
            error: error.message
        });
    }
};

// Get course statistics
const getCourseStats = async (req, res) => {
    try {
        const total = await CourseModel.countDocuments();
        const approved = await CourseModel.countDocuments({ isApproved: true });
        const pending = await CourseModel.countDocuments({ isApproved: false });
        const published = await CourseModel.countDocuments({ status:'published' });
        const draft = await CourseModel.countDocuments({ status:'draft' });
        const archived = await CourseModel.countDocuments({ status:'archived' });
        const suspended = await CourseModel.countDocuments({ status:'suspended' });

        // Calculate total revenue from approved courses
        const revenueResult = await CourseModel.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: null, totalRevenue: { $sum:"$price" } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Calculate total enrollments
        const enrollmentResult = await CourseModel.aggregate([
            { $group: { _id: null, totalEnrollments: { $sum:"$enrollmentCount" } } }
        ]);
        const totalEnrollments = enrollmentResult[0]?.totalEnrollments || 0;

        // Get category-wise course count
        const categoryStats = await CourseModel.aggregate([
            {
                $group: {
                    _id:'$course_category',
                    count: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get monthly course creation trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await CourseModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year:'$createdAt' },
                        month: { $month:'$createdAt' }
                    },
                    count: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] }
                    }
                }
            },
            { $sort: {'_id.year': 1,'_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                overview: {
                    total,
                    approved,
                    pending,
                    published,
                    draft,
                    archived,
                    suspended,
                    totalRevenue,
                    totalEnrollments
                },
                categoryStats,
                monthlyTrend
            }
        });
    } catch (error) {
        console.error('Error fetching course stats:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch course statistics',
            error: error.message
        });
    }
};

// Delete course (admin only)
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message:'Course not found'
            });
        }

        // Check for purchases before deletion
        const { canDelete, message } = await checkCoursePurchases(id);
        if (!canDelete) {
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        await CourseModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message:'Failed to delete course',
            error: error.message
        });
    }
};

// Bulk approve courses
const bulkApproveCourses = async (req, res) => {
    try {
        const { courseIds } = req.body;
        const adminId = req.admin?.id;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message:'Course IDs array is required'
            });
        }

        const result = await CourseModel.updateMany(
            { _id: { $in: courseIds } },
            {
                isApproved: true,
                status:'published',
                approvedBy: adminId,
                approvedAt: new Date(),
                rejectedBy: null,
                rejectedAt: null,
                rejectionReason: null
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} courses approved successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk approving courses:', error);
        res.status(500).json({
            success: false,
            message:'Failed to approve courses',
            error: error.message
        });
    }
};

// Bulk update course status
const bulkUpdateStatus = async (req, res) => {
    try {
        const { courseIds, status } = req.body;

        const validStatuses = ['draft','pending','published','archived','suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid statuses are: ${validStatuses.join(',')}`
            });
        }

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message:'Course IDs array is required'
            });
        }

        const result = await CourseModel.updateMany(
            { _id: { $in: courseIds } },
            {
                status,
                updatedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} courses updated to ${status}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk updating courses:', error);
        res.status(500).json({
            success: false,
            message:'Failed to update courses',
            error: error.message
        });
    }
};

// Bulk reject/unapprove courses
const bulkRejectCourses = async (req, res) => {
    try {
        const { courseIds, rejectionReason } = req.body;
        const adminId = req.admin?.id;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course IDs array is required'
            });
        }

        const result = await CourseModel.updateMany(
            { _id: { $in: courseIds } },
            {
                isApproved: false,
                status: 'pending',
                rejectedBy: adminId,
                rejectedAt: new Date(),
                rejectionReason: rejectionReason || 'Bulk unapproved by Admin'
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} courses unapproved successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk rejecting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unapprove courses',
            error: error.message
        });
    }
};

// Bulk delete courses
const bulkDeleteCourses = async (req, res) => {
    try {
        const { courseIds } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course IDs array is required'
            });
        }

        const result = await CourseModel.deleteMany({ _id: { $in: courseIds } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} courses deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error bulk deleting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete courses',
            error: error.message
        });
    }
};

// Export courses to CSV (admin)
const exportCourses = async (req, res) => {
    try {
        const { status, isApproved, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (isApproved !== undefined && isApproved !== '') {
            filter.isApproved = isApproved === 'true';
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { short_desc: { $regex: search, $options: 'i' } },
                { course_category: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await CourseModel.find(filter)
            .populate('teacher_id', 'tname temail')
            .populate('course_category_ref', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // CSV header
        const headers = [
            'Title', 'Category', 'Teacher', 'Status', 'Approved',
            'Actual Price', 'Discounted Price', 'Discount %',
            'Duration', 'Enrolled', 'Rating', 'Created At'
        ];

        // Escape a value for CSV
        const csvEscape = (val) => {
            if (val === null || val === undefined) return '';
            const s = String(val);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        };

        const rows = courses.map((c) => [
            c.title,
            c.course_category_ref?.name || c.course_category || '',
            c.teacher_id?.tname || '',
            c.status,
            c.isApproved ? 'Yes' : 'No',
            c.actual_price,
            c.discounted_price,
            c.discount_percentage,
            c.duration,
            c.enrolled_count,
            c.rating,
            c.createdAt ? new Date(c.createdAt).toISOString() : ''
        ].map(csvEscape).join(','));

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="courses-export-${Date.now()}.csv"`);
        res.status(200).send(csv);
    } catch (error) {
        console.error('Error exporting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export courses',
            error: error.message
        });
    }
};

module.exports = {
    getAllCoursesAdmin,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
    getCourseStats,
    deleteCourse,
    bulkApproveCourses,
    bulkRejectCourses,
    bulkUpdateStatus,
    bulkDeleteCourses,
    exportCourses
};
