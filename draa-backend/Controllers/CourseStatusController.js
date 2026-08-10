const CourseModel = require('../Models/CourseModel');

const updateCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['draft','published','archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:'Invalid status. Valid statuses are: draft, published, archived'
            });
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            { 
                status, 
                updatedAt: new Date() 
            },
            { new: true }
        ).populate('teacher_id','tname temail tspecialization');

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message:'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Course status updated to ${status}`,
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error updating course status:', error);
        res.status(500).json({
            success: false,
            message:'Failed to update course status'
        });
    }
};

module.exports = updateCourseStatus;
