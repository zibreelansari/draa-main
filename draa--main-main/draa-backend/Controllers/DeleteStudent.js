const UserModel = require('../Models/UserModel');
const { checkStudentAssociations } = require('../utils/studentDeletionCheck');

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message:'Invalid student ID format' });
        }

        // Check if student exists
        const student = await UserModel.findById(id);
        if (!student) {
            return res.status(404).json({ message:'Student not found' });
        }

        // Check for associated purchases and activity
        const { canDelete, message } = await checkStudentAssociations(id);
        if (!canDelete) {
            return res.status(400).json({
                message: message,
                canDelete: false
            });
        }

        // Delete the student
        await UserModel.findByIdAndDelete(id);

        return res.status(200).json({
            message:'Student deleted successfully',
            canDelete: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message:'Internal server error' });
    }
};

module.exports = deleteStudent;
