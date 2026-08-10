const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: String, //'admin', or userId (ObjectId as string)
    required: true
  },
  recipientModel: {
    type: String,
    enum: ['User','Teacher','Admin','all_students','all'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath:'senderModel',
    default: null
  },
  senderModel: {
    type: String,
    enum: ['User','Teacher','Admin'],
    default:'Teacher'
  },
  senderName: {
    type: String,
    default:''
  },
  type: {
    type: String,
    enum: ['course_upload','content_upload','book_upload','job_alert','general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

NotificationSchema.index({ recipient: 1, createdAt: -1 });

// Hook: Every time a notification is created & saved in DB, push it instantly via WebSocket
NotificationSchema.post('save', function (doc) {
  try {
    const socketService = require('../utils/socketService');
    socketService.sendNotification(doc);
  } catch (err) {
    console.error("Error executing real-time notification socket dispatch:", err);
  }
});

// Avoid OverwriteModelError if model already registered
module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

