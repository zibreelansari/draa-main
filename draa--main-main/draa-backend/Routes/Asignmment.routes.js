const express=require('express');
const AssignmentController=require('../Controllers/AssignmentController');
const upload = require("../Controllers/assignmentMulter"); // adjust path as per structure

const router=express.Router();

// routes/assignmentRoutes.js
router.post("/create", AssignmentController.createAssignment);

// GET all assignments by teacher
router.get("/all/:teacherId", AssignmentController.getAllByTeacher);

//make live assignmments
router.put('/make-live/:id',AssignmentController.liveAssignmments)

//delete 
router.delete('/delete/:id',AssignmentController.delete);

router.post(
"/upload/:assignmentId",
  upload.array("fileUrl", 10), // field name is fileUrl, max 10 files
  AssignmentController.uploadAssignmentFiles
);

// GET /assignments/:assignmentId
router.get("/:assignmentId", AssignmentController.getAssignmentById);
router.get("/admin/assignments", AssignmentController.getAllAssignmentsAdmin);
router.put('/update/:id',AssignmentController.updateAssignments)

module.exports=router;


