let ioInstance = null;

module.exports = {
  setIO: (io) => {
    ioInstance = io;
  },
  getIO: () => ioInstance,
  sendNotification: (notification) => {
    if (!ioInstance) {
      console.warn("Socket.io instance not set in socketService yet.");
      return;
    }

    const recipient = notification.recipient; // can be 'admin', 'all_students', 'all_teachers', 'all', or userId string
    const payload = {
      success: true,
      data: notification
    };

    console.log(`Sending real-time notification to: ${recipient}`);

    // Standard Room-based delivery
    if (recipient === 'all') {
      ioInstance.to('all').emit('new_notification', payload);
      ioInstance.emit('new_notification', payload); // global fallback
    } else if (recipient === 'all_students') {
      ioInstance.to('student').emit('new_notification', payload);
      ioInstance.to('all_students').emit('new_notification', payload);
      ioInstance.emit('new_notification_student', payload); // global fallback
    } else if (recipient === 'all_teachers') {
      ioInstance.to('teacher').emit('new_notification', payload);
      ioInstance.to('all_teachers').emit('new_notification', payload);
      ioInstance.emit('new_notification_teacher', payload); // global fallback
    } else if (recipient === 'admin') {
      ioInstance.to('admin').emit('new_notification', payload);
      ioInstance.emit('new_notification_admin', payload); // global fallback
    } else {
      // Individual delivery via targeted room & targeted custom channel
      ioInstance.to(recipient).emit('new_notification', payload);
      ioInstance.emit(`new_notification_${recipient}`, payload); // global fallback
    }
  }
};
