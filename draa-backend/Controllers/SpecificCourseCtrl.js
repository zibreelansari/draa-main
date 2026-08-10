const express = require('express');
const CourseModel = require('../Models/CourseModel');

const courseDetails = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message:"Course not found" })
        }
        res.status(200).json({ course })

    } catch (error) {
        res.status(500).json({ message:"Internal Server Error" })

    }
}

module.exports = courseDetails;