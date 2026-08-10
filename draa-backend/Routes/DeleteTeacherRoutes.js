const express = require('express');
const deleteTeacher = require('../Controllers/DeleteTeacher');
const adminAuth = require('../Middlewares/adminAuth.middleware');

const router = express.Router();

// delete teacher route (protected - requires admin authentication)
router.delete('/:id', adminAuth, deleteTeacher);

module.exports = router;
