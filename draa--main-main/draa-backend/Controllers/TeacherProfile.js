const express = require('express');
const TeacherModel=require('../Models/TeacherModel');

const teacherProfileController = async (req, res) => {
    try {
        const teacherId = req.params.id; // Assuming you're passing the teacher ID in the URL
        const teacher = await TeacherModel.findById(teacherId)
        // res.send(teacher);
        if (!teacher) {
            return res.status(404).json({ message:'Teacher not found' });
        }

        res.status(200).json({ teacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'Server error' });
    }
}

module.exports = teacherProfileController;