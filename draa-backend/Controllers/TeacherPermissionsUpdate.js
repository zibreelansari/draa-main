const TeacherModel = require('../Models/TeacherModel');
const mongoose = require('mongoose');

const updateTeacherPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message:'Permissions must be an array'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:'Invalid teacher ID'
            });
        }

        const teacher = await TeacherModel.findById(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message:'Teacher not found'
            });
        }

        teacher.permissions = permissions;
        teacher.tokenVersion = (teacher.tokenVersion || 0) + 1; // Force logout
        await teacher.save();

        res.status(200).json({
            success: true,
            message: `Permissions updated for ${teacher.tname}`,
            data: {
                permissions: teacher.permissions
            }
        });

    } catch (error) {
        console.error("Error updating teacher permissions:", error);
        res.status(500).json({
            success: false,
            message:"Internal server error"
        });
    }
};

module.exports = updateTeacherPermissions;
