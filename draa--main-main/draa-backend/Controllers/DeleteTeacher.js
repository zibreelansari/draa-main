const TeacherModel = require('../Models/TeacherModel');
const { checkTeacherAssociations } = require('../utils/teacherDeletionCheck');

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message:'Invalid teacher ID format' });
        }

        // Check if teacher exists
        const teacher = await TeacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ message:'Teacher not found' });
        }

        // Check for associated content
        const { canDelete, message } = await checkTeacherAssociations(id);
        if (!canDelete) {
            return res.status(400).json({
                message: message,
                canDelete: false
            });
        }

        // Delete the teacher
        await TeacherModel.findByIdAndDelete(id);

        return res.status(200).json({
            message:'Teacher deleted successfully',
            canDelete: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message:'Internal server error' });
    }
};

module.exports = deleteTeacher;
