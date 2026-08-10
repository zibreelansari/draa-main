const express = require('express');
const mongoose = require('mongoose');
const CourseModel = require('../Models/CourseModel');

const CourseDetailsController = async (req, res) => {
  try {
    const { id } = req.params;

    //  Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message:'Invalid Course ID' });
    }

    //  Find course
    const course = await CourseModel.findById(id);

    if (!course) {
      return res.status(404).json({ message:'Course not found' });
    }

    res.status(200).json({ status: true, course: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message:'Server error' });
  }
};




const GetCoursesByTeacherController = async (req, res) => {
  try {
    // Get the teacherId from the URL parameters
    const { teacherId } = req.params;

    // Validate the provided teacher ID to ensure it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message:'Invalid Teacher ID format' });
    }

    // Find all courses where the'teacher_id' field matches the provided teacherId.
    // The `find()` method returns an array of documents.
    const courses = await CourseModel.find({ teacher_id: teacherId });

    // If no courses are found for this teacher, return a 404 Not Found error.
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message:'No courses found for this teacher' });
    }

    // Return a successful response with the array of courses.
    res.status(200).json({ status: true, courses: courses });

  } catch (error) {
    // Log the error to the console for debugging purposes.
    console.error("Error fetching courses by teacher:", error);
    // Return a generic server error message to the client.
    res.status(500).json({ message:'Server error' });
  }
};




module.exports = { CourseDetailsController, GetCoursesByTeacherController };
