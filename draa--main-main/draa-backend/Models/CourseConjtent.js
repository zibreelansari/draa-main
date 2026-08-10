const mongoose = require("mongoose");

const CourseContentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },

    content_subject: {
        type: String,
        required: true,
    },
    content_category: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    //  NEW: Two separate image fields
    schema_image: {
        type: String,  // Single main/reference image
        required: false
    },
    featured_images: [{
        type: String   // Multiple gallery images
    }],
    youtube_url: {
        type: String
    },
    instagram_url: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Optional for legacy records
    },
    creatorRole: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: false
    },
    likes: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userRole: { type: String, required: true, enum: ['student', 'teacher', 'admin'] }
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userRole: { type: String, required: true, enum: ['student', 'teacher', 'admin'] },
        userName: { type: String, required: true },
        userAvatar: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes
CourseContentSchema.index({ content_category: 1, approved: 1 });
CourseContentSchema.index({ content_subject: 'text', content: 'text' });

const CourseContentModel = mongoose.model("CourseContent", CourseContentSchema);
module.exports = CourseContentModel;
