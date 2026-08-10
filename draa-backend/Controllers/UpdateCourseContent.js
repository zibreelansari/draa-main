const CourseContent = require('../Models/CourseConjtent');
const User = require('../Models/UserModel');
const CoinTransaction = require('../Models/CoinTransaction');

const updateStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const blog = await CourseContent.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:'Blog not found'
      });
    }

    // approve blog
    blog.approved = true;
    await blog.save();

    const REWARD_COINS = 50;

    // ONLY reward if blog belongs to student
    if (blog.student) {

      const user = await User.findById(blog.student);

      if (user) {

        user.coins = (user.coins || 0) + REWARD_COINS;
        await user.save();

        await CoinTransaction.create({
          user: blog.student,
          amount: REWARD_COINS,
          type:"credit",
          source:"blog_reward",
          referenceId: blog._id,
          description:"Coins earned for approved blog"
        });

        // Create notification for student
        try {
            const Notification = require("../Models/NotificationModel");
            await Notification.create({
                recipient: blog.student.toString(),
                recipientModel:'User',
                sender: null,
                senderModel:'Admin',
                senderName:'EduDocs Team',
                type:'general',
                title:'Blog Approved!',
                message: `Congratulations! Your blog post"${blog.content_subject}" has been approved. ${REWARD_COINS} Coins have been credited to your wallet!`,
                referenceId: blog._id
            });
            console.log('Notification triggered for student blog approval');
        } catch (notifErr) {
            console.error('Failed to trigger student blog approval notification:', notifErr);
        }

        return res.status(200).json({
          success: true,
          message: `Blog approved and ${REWARD_COINS} coins credited`,
          coins: REWARD_COINS,
          resp: blog
        });

      }

    }

    // Create notification for teacher
    try {
        if (blog.createdBy) {
            const Notification = require("../Models/NotificationModel");
            await Notification.create({
                recipient: blog.createdBy.toString(),
                recipientModel:'Teacher',
                sender: null,
                senderModel:'Admin',
                senderName:'EduDocs Team',
                type:'content_upload',
                title:'Blog/Content Approved!',
                message: `Congratulations! Your published content"${blog.content_subject}" has been approved by the Admin and is now live.`,
                referenceId: blog._id
            });
            console.log('Notification triggered for teacher blog approval');
        }
    } catch (notifErr) {
        console.error('Failed to trigger teacher blog approval notification:', notifErr);
    }

    // Create notification for all students
    try {
        const Notification = require("../Models/NotificationModel");
        await Notification.create({
            recipient:'all_students',
            recipientModel:'User',
            sender: null,
            senderModel:'Admin',
            senderName:'EduDocs Team',
            type:'content_upload',
            title:'New Blog Published!',
            message: `New Blog Published:"${blog.content_subject}" is now live! Read now.`,
            referenceId: blog._id
        });
        console.log('Notification triggered for all students on blog approval');
    } catch (notifErr) {
        console.error('Failed to trigger all_students blog notification:', notifErr);
    }

    // teacher content (no coins)
    res.status(200).json({
      success: true,
      message:"Blog approved successfully",
      resp: blog
    });

  } catch (error) {

    console.error("Approve Blog Error:", error);

    res.status(500).json({
      success: false,
      message:"Internal server error"
    });

  }
};

module.exports = updateStatus;