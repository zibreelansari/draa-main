const Coupon = require('../Models/Coupon');
const CouponAssignment = require('../Models/CouponAssignment');
const User = require('../Models/UserModel');
const emailService = require('../Config/elastic.emails');

// 1. Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, description, expiryDate, maxUses } = req.body;
    
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      description,
      expiryDate,
      maxUses
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Coupons (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    // Delete assignments too
    await CouponAssignment.deleteMany({ coupon: req.params.id });
    res.status(200).json({ success: true, message: 'Coupon and assignments deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Assign Coupon to Students (Admin)
exports.assignCoupon = async (req, res) => {
  try {
    const { couponId, emails } = req.body;
    
    if (!couponId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const results = [];

    for (const rawEmail of emails) {
      const email = rawEmail.trim().toLowerCase();
      if (!email) continue;

      // Check if student exists online
      const student = await User.findOne({ email });
      const assignedType = student ? 'online' : 'offline';
      const studentId = student ? student._id : null;

      try {
        // Create assignment (or skip if already assigned)
        const assignmentExists = await CouponAssignment.findOne({ coupon: couponId, email });
        
        if (!assignmentExists) {
          await CouponAssignment.create({
            coupon: couponId,
            student: studentId,
            email,
            assignedType
          });
        }

        // Send Email
        const discountInfo = coupon.discountType === 'percentage' 
          ? `${coupon.discountValue}% OFF` 
          : `₹${coupon.discountValue} OFF`;

        await emailService.sendCouponEmail(email, coupon.code, discountInfo, coupon.description, coupon.expiryDate);

        results.push({ email, status: 'success', assignedType });
      } catch (err) {
        results.push({ email, status: 'failed', error: err.message });
      }
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Coupon Assignments (Admin)
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await CouponAssignment.find()
      .populate('coupon')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get My Coupons (Student)
exports.getMyCoupons = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const email = req.user.email.toLowerCase();

    // Map any offline assignments to this student ID if they just logged in
    await CouponAssignment.updateMany({ email, student: null }, { student: studentId, assignedType: 'online' });

    // Retrieve active coupons for this student
    const assignments = await CouponAssignment.find({
      $or: [
        { student: studentId },
        { email }
      ],
      isUsed: false
    }).populate('coupon');

    // Filter out expired coupons or inactive ones
    const activeCoupons = assignments
      .filter(a => a.coupon && a.coupon.isActive && new Date(a.coupon.expiryDate) > new Date())
      .map(a => ({
        assignmentId: a._id,
        code: a.coupon.code,
        discountType: a.coupon.discountType,
        discountValue: a.coupon.discountValue,
        description: a.coupon.description,
        expiryDate: a.coupon.expiryDate
      }));

    res.status(200).json({ success: true, data: activeCoupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Verify Coupon (General / Checkout Verification)
exports.verifyCoupon = async (req, res) => {
  try {
    const { code, email } = req.body;
    
    if (!code || !email) {
      return res.status(400).json({ success: false, message: 'Code and email are required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }

    // Check if the coupon is assigned specifically to this email
    const assignment = await CouponAssignment.findOne({
      coupon: coupon._id,
      email: email.toLowerCase()
    });

    if (!assignment) {
      return res.status(400).json({ success: false, message: 'This coupon is not assigned to your account.' });
    }

    if (assignment.isUsed) {
      return res.status(400).json({ success: false, message: 'This coupon has already been used.' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid.',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
