const express = require('express');
const mongoose = require('mongoose');
const UpdateTeacherStatus = require('../Controllers/TeacherStatusUpdate');

const router = express.Router();

// ===== MIDDLEWARE =====

// Validate MongoDB ObjectId format
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message:'Invalid teacher ID format'
        });
    }
    
    next();
};

// Validate request body for status update
const validateStatusBody = (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['pending','approved','rejected','suspended'];
    
    if (!status) {
        return res.status(400).json({
            success: false,
            message:'Status is required in request body',
            validStatuses: validStatuses
        });
    }
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Valid statuses are: ${validStatuses.join(',')}`,
            providedStatus: status,
            validStatuses: validStatuses
        });
    }
    
    next();
};

// Logging middleware for audit trail
const logStatusUpdate = (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const timestamp = new Date().toISOString();
    const adminId = req.admin?.id || req.user?.id ||'unknown';
    
    console.log(`[${timestamp}] Teacher Status Update Request - Admin: ${adminId}, Teacher ID: ${id}, New Status: ${status}`);
    
    next();
};

// ===== ROUTES =====

// Route to update teacher permissions
router.put('/:id/permissions', [
    validateObjectId,
    require('../Controllers/TeacherPermissionsUpdate')
]);

// Main route to update teacher status
router.put('/:id', [
    validateObjectId,
    validateStatusBody,
    logStatusUpdate,
    UpdateTeacherStatus
]);

// Get teacher status
router.get('/:id/status', validateObjectId, async (req, res) => {
    try {
        const TeacherModel = require('../Models/TeacherModel');
        const teacher = await TeacherModel.findById(req.params.id)
            .select('tname temail Status isVerified approvedAt rejectedAt rejectionReason approvedBy rejectedBy');
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message:'Teacher not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                teacherId: teacher._id,
                teacherName: teacher.tname,
                teacherEmail: teacher.temail,
                status: teacher.Status,
                isVerified: teacher.isVerified,
                approvedAt: teacher.approvedAt,
                rejectedAt: teacher.rejectedAt,
                rejectionReason: teacher.rejectionReason
            }
        });
        
    } catch (error) {
        console.error('Error fetching teacher status:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch teacher status'
        });
    }
});

// Get all teachers with their status (for admin dashboard)
router.get('/all', async (req, res) => {
    const TeacherModel = require('../Models/TeacherModel');
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        // Build filter
        let filter = {};
        if (status && ['pending','approved','rejected','suspended'].includes(status)) {
            filter.Status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const teachers = await TeacherModel.find(filter)
            .select('tname temail tphn tspecialization tcity Status isVerified createdAt approvedAt rejectedAt permissions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await TeacherModel.countDocuments(filter);
        
        // Get status counts
        const statusCounts = await TeacherModel.aggregate([
            {
                $group: {
                    _id:'$Status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            suspended: 0,
            total: total
        };
        
        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });
        
        res.status(200).json({
            success: true,
            data: {
                teachers: teachers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalCount: total,
                    hasNext: skip + teachers.length < total,
                    hasPrev: parseInt(page) > 1
                },
                statusCounts: counts
            }
        });
        
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch teachers'
        });
    }
});

// Batch status update route
router.patch('/batch-update', async (req, res) => {
    try {
        const { teacherIds, status, rejectionReason } = req.body;
        
        // Validate input
        if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
            return res.status(400).json({
                success: false,
                message:'teacherIds must be a non-empty array'
            });
        }
        
        const validStatuses = ['pending','approved','rejected','suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid statuses are: ${validStatuses.join(',')}`
            });
        }
        
        // Validate all ObjectIds
        const invalidIds = teacherIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message:'Invalid teacher IDs found',
                invalidIds: invalidIds
            });
        }
        
        const TeacherModel = require('../Models/TeacherModel');
        const adminId = req.admin?.id || req.user?.id || null;
        
        // Prepare update data
        const updateData = {
            Status: status
        };
        
        if (status ==='approved') {
            updateData.approvedBy = adminId;
            updateData.approvedAt = new Date();
            updateData.isVerified = true;
            updateData.isActive = true;
        } else if (['rejected','suspended'].includes(status)) {
            updateData.rejectedBy = adminId;
            updateData.rejectedAt = new Date();
            updateData.rejectionReason = rejectionReason || `Batch ${status}`;
            updateData.isActive = false;
            updateData.isVerified = false;
        }
        
        // Perform batch update
        const result = await TeacherModel.updateMany(
            { _id: { $in: teacherIds } },
            { 
                $set: updateData,
                $inc: { tokenVersion: 1 }
            }
        );
        
        console.log(`Batch status update: ${result.modifiedCount} teachers updated to ${status} by admin ${adminId}`);
        
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} teachers updated successfully`,
            data: {
                requestedCount: teacherIds.length,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                status: status,
                updatedBy: adminId,
                updatedAt: new Date()
            }
        });
        
    } catch (error) {
        console.error('Error in batch status update:', error);
        res.status(500).json({
            success: false,
            message:'Batch update failed',
            error: process.env.NODE_ENV ==='development' ? error.message : undefined
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Teacher status router error:', error);
    
    if (error.name ==='CastError') {
        return res.status(400).json({
            success: false,
            message:'Invalid data format'
        });
    }
    
    if (error.name ==='ValidationError') {
        return res.status(400).json({
            success: false,
            message:'Validation failed',
            error: error.message
        });
    }
    
    res.status(500).json({
        success: false,
        message:'Internal server error',
        error: process.env.NODE_ENV ==='development' ? error.message :'Something went wrong'
    });
});

module.exports = router;
