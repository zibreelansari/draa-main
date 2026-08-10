const express = require('express');

const  courseModel = require('../Models/CourseModel');

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseModel.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message:'Course not found' });
        }
        res.status(200).json({ message:'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message:'Server error', error: error.message });
    }
}


module.exports = deleteCourse;