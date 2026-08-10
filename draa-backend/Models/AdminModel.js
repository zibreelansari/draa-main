const mongoose = require("mongoose");

// Schema Designing
const AdminSchema = new mongoose.Schema(
  {
    aname: {
      type: String,
      required: [true,"Please provide a name"],
    },
    aemail: {
      type: String,
      required: [true,"Please provide an email"],
      unique: true,
    },
    apassword: {
      type: String,
      required: [true,"Please provide a password"],
    },

    //  OTP fields (REQUIRED for MFA)
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Exporting Admin Model
const Admin = mongoose.model("admins", AdminSchema);
// Also register as"Admin" to resolve legacy references and population errors
if (!mongoose.models.Admin) {
    mongoose.model("Admin", AdminSchema);
}
module.exports = Admin;