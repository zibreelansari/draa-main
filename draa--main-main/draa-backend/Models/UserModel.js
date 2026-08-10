const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true,"Please provide a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true,"Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phn: {
      type: String,
      // required: [true,"Please provide a phone number"],
      unique: true,
      sparse: true,   // allows multiple null values (e.g. Google OAuth users without phone)
      trim: true,
    },

    password: {
      type: String,
      // required: [true,"Please provide a password"],
      select: false,
    },

    Status: {
      type: String,
      enum: ["pending","approved","Rejected","Verified"],
      default:"pending",
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    lastPasswordChangedAt: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null
    },

    authProvider: {
      type: String,
      enum: ["local","google"],
      default:"local"
    },

    avatar: {
      type: String,
      default: null
    },

    deliveryAddress: {
      fullName: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      house: { type: String, trim: true, default: "" },
      area: { type: String, trim: true, default: "" },
      landmark: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" }
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    coins: {
      type: Number,
      default: 0
    },

    settings: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "en" },
      privacy: {
        showProfile: { type: Boolean, default: true },
        showRanking: { type: Boolean, default: true }
      }
    },

    devices: [
      {
        deviceId: { type: String, required: true },
        deviceType: { type: String, default: "Browser" },
        browser: { type: String, default: "Unknown" },
        os: { type: String, default: "Unknown" },
        ipAddress: { type: String, default: "Unknown" },
        location: { type: String, default: "Unknown" },
        lastUsedAt: { type: Date, default: Date.now },
        registeredAt: { type: Date, default: Date.now }
      }
    ]

  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
if (!mongoose.models.users) {
    mongoose.model("users", UserSchema);
}
module.exports = User;
