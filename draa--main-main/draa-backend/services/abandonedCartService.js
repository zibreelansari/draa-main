const Cart = require('../Models/CartModel');
const User = require('../Models/UserModel');
const StudentBookPurchase = require('../Models/BooksPurchaseModels');
const { noReplyTransporter } = require('../utils/mailConfig');
const { generateAbandonedCartEmail } = require('../utils/emailTemplates');

/**
 * Checks for abandoned carts and sends daily emails.
 */
const checkAbandonedCarts = async () => {
  try {
    console.log('[AbandonedCartService] Starting check for abandoned carts...');
    
    // Find all carts that have items
    const carts = await Cart.find({ 'items.0': { $exists: true } });
    console.log(`[AbandonedCartService] Found ${carts.length} active carts in database.`);

    for (const cart of carts) {
      try {
        const userId = cart.userId;

        // Fetch User details
        const user = await User.findById(userId);
        if (!user) {
          console.warn(`[AbandonedCartService] User not found for Cart: ${userId}. Skipping.`);
          continue;
        }

        // Fetch student's completed book purchases
        const completedPurchases = await StudentBookPurchase.find({
          student_id: userId.toString(),
          'purchase_details.payment_status': 'completed'
        }).select('book_id');

        const purchasedBookIds = new Set(completedPurchases.map(p => p.book_id.toString()));

        // Filter out items that have already been purchased
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => !purchasedBookIds.has(item.bookId.toString()));

        if (cart.items.length === 0) {
          if (originalLength > 0) {
            console.log(`[AbandonedCartService] All items in cart for user ${user.email} were purchased. Clearing cart.`);
            await cart.save();
          }
          continue;
        }

        // Save cart if some purchased items were removed
        if (cart.items.length !== originalLength) {
          console.log(`[AbandonedCartService] Removed purchased items from cart for user ${user.email}.`);
          await cart.save();
        }

        // Check if 24 hours have passed since last email
        const now = new Date();
        const lastSent = cart.lastEmailSentAt;
        const hoursSinceLastEmail = lastSent ? (now - new Date(lastSent)) / (1000 * 60 * 60) : null;

        if (lastSent === null || hoursSinceLastEmail >= 24) {
          console.log(`[AbandonedCartService] Sending abandoned cart email to ${user.email} (last sent: ${lastSent || 'Never'}).`);

          const emailHtml = generateAbandonedCartEmail(user.name || 'Student', cart.items);

          const mailOptions = {
            from: `"Draa" <no-reply@draa.in>`,
            to: user.email,
            subject: 'Items left in your cart - Draa',
            html: emailHtml
          };

          await noReplyTransporter.sendMail(mailOptions);
          console.log(`[AbandonedCartService] Abandoned cart email successfully sent to ${user.email}.`);

          // Update email stats
          cart.lastEmailSentAt = now;
          cart.emailSentCount = (cart.emailSentCount || 0) + 1;
          await cart.save();
        } else {
          console.log(`[AbandonedCartService] User ${user.email} already emailed ${hoursSinceLastEmail.toFixed(1)} hours ago. Skipping.`);
        }

      } catch (cartError) {
        console.error(`[AbandonedCartService] Error processing cart for user ${cart.userId}:`, cartError);
      }
    }

    console.log('[AbandonedCartService] Abandoned carts check finished.');
  } catch (error) {
    console.error('[AbandonedCartService] Critical error in checkAbandonedCarts:', error);
  }
};

/**
 * Starts the abandoned cart checking service.
 */
const start = () => {
  // Run on startup (with small delay so DB is fully connected)
  setTimeout(() => {
    checkAbandonedCarts();
  }, 10000);

  // Repeat every 1 hour (3600000 milliseconds)
  setInterval(() => {
    checkAbandonedCarts();
  }, 3600000);

  console.log('[AbandonedCartService] Service initialized and scheduled.');
};

module.exports = {
  start,
  checkAbandonedCarts // Exposed for manual triggering / testing
};
