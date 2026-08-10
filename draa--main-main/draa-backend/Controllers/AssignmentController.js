const Assignment = require('../Models/Assignmentmodel')
const express = require("express");





//  Upload Route  multiple files under field"fileUrl"
// controllers/assignmentController.js
exports.uploadAssignmentFiles = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message:"Assignment not found" });

    const fileData = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      uploadedAt: new Date(),
    }));

    // Assuming fileUrl is an array of file objects or paths
    assignment.fileUrl = [...(assignment.fileUrl || []), ...fileData];
    await assignment.save();

    res.json({ message:"Files uploaded", files: assignment.fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};






// controllers/AssignmentController.js
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, description, marks, passmarks, createdBy } = req.body;

    if (!title || !subject || !marks || !passmarks || !createdBy) {
      return res.status(400).json({ error:"Missing required fields" });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      marks,
      passmarks,
      createdBy
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"Server error while creating assignment" });
  }
};



// fetch assignmments
exports.getAllByTeacher = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.params.teacherId }).sort({ createdAt: -1 });
    res.json({
      message:"true",
      assignments: assignments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






// fetch assignmments
exports.getAllAssignmentsAdmin = async (req, res) => {
  try {
    const assignments = await Assignment.find({});
    res.json({
      message:"true",
      assignments: assignments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.liveAssignmments = async (req, res) => {
  try {
    const { dueDate } = req.body;

    if (!dueDate) return res.status(400).json({ error:"Due date is required" });

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        live_Status: true,
        dueDate: new Date(dueDate),
        createdAt: new Date()
      },
      { new: true }
    );

    res.json({ message:'Assignment marked as live', assignment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Failed to make assignment live' });
  }
}



// delete 

exports.delete = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message:'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error:'Delete failed' });
    console.log(err);

  }
}



exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error:"Assignment not found" });
    }
    res.json({
      message:"true",
      assignment: assignment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"Server error", details: err.message });
  }
};



exports.updateAssignments = async (req, res) => {
  try {
    const assignmentId = req.params.id; // Get the assignment ID from URL parameters
    const { title, subject, description, marks, passmarks } = req.body;

    // Validate required fields
    if (!title || !subject || !marks || !passmarks) {
      return res.status(400).json({ error:"Missing required fields" });
    }

    // Check if assignment exists
    const existingAssignment = await Assignment.findById(assignmentId);
    if (!existingAssignment) {
      return res.status(404).json({ error:"Assignment not found" });
    }

    // Update the assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        title,
        subject,
        description,
        marks: Number(marks), // Ensure it's a number
        passmarks: Number(passmarks), // Ensure it's a number
        updatedAt: new Date(), // Add updated timestamp
        // Reset to pending after edit
        live_Status: false
      },
      {
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    );

    res.status(200).json({
      success: true,
      message:"Assignment updated successfully",
      assignment: updatedAssignment
    });
  } catch (err) {
    console.error("Update assignment error:", err);
    res.status(500).json({
      error:"Server error while updating assignment",
      details: err.message
    });
  }
};

