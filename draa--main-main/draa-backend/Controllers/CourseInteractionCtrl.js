const CourseContentModel = require('../Models/CourseConjtent');
const mongoose = require('mongoose');

// Toggle Like
const toggleLike = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid blog post ID' });
        }

        const blog = await CourseContentModel.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Determine user details based on role from universalAuth middleware
        let currentUserId;
        let currentUserRole;

        if (req.user) {
            currentUserId = req.user._id;
            currentUserRole = 'student';
        } else if (req.teacher) {
            currentUserId = req.teacher._id;
            currentUserRole = 'teacher';
        } else if (req.adminId) {
            currentUserId = req.adminId;
            currentUserRole = 'admin';
        } else {
            return res.status(401).json({ success: false, message: 'Unauthorized interaction' });
        }

        // Ensure likes array is initialized
        if (!blog.likes) {
            blog.likes = [];
        }

        // Check if user has already liked
        const existingLikeIndex = blog.likes.findIndex(
            (like) => String(like.userId) === String(currentUserId) && like.userRole === currentUserRole
        );

        if (existingLikeIndex > -1) {
            // User already liked, so unlike (remove)
            blog.likes.splice(existingLikeIndex, 1);
        } else {
            // User hasn't liked, so like (add)
            blog.likes.push({
                userId: currentUserId,
                userRole: currentUserRole
            });
        }

        await blog.save();

        res.status(200).json({
            success: true,
            message: existingLikeIndex > -1 ? 'Post unliked' : 'Post liked',
            likes: blog.likes
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Add Comment
const addComment = async (req, res) => {
    try {
        const id = req.params.id;
        const { text } = req.body;

        // Validate Input
        if (!text || String(text).trim() === '') {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid blog post ID' });
        }

        const blog = await CourseContentModel.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Resolve author info based on active role
        let currentUserId;
        let currentUserRole;
        let currentUserName;
        let currentUserAvatar = null;

        if (req.user) {
            currentUserId = req.user._id;
            currentUserRole = 'student';
            currentUserName = req.user.name || 'Student';
            currentUserAvatar = req.user.avatar || null;
        } else if (req.teacher) {
            currentUserId = req.teacher._id;
            currentUserRole = 'teacher';
            currentUserName = req.teacher.tname || 'Teacher';
            currentUserAvatar = req.teacher.tphoto || null;
        } else if (req.adminId) {
            currentUserId = req.adminId;
            currentUserRole = 'admin';
            currentUserName = 'Administrator';
            currentUserAvatar = null;
        } else {
            return res.status(401).json({ success: false, message: 'Unauthorized interaction' });
        }

        // Ensure comments array is initialized
        if (!blog.comments) {
            blog.comments = [];
        }

        // Append new comment
        const newComment = {
            userId: currentUserId,
            userRole: currentUserRole,
            userName: currentUserName,
            userAvatar: currentUserAvatar,
            text: String(text).trim(),
            createdAt: new Date()
        };

        blog.comments.push(newComment);
        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comments: blog.comments
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    toggleLike,
    addComment
};
