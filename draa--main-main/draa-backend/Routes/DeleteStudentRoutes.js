const express = require('express');
const deleteStudent = require('../Controllers/DeleteStudent');
const adminAuth = require('../Middlewares/adminAuth.middleware');

const router = express.Router();

// delete student route (protected - requires admin authentication)
router.delete('/:id', adminAuth, deleteStudent);

module.exports = router;
