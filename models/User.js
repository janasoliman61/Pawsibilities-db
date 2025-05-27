// models/User.js
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema(
//   {
//     userId: {type: Number,unique: true,},
//     firstName: { type: String, required: true },
//     lastName:  { type: String, required: true },
//     userName:  { type: String, required: true, unique: true },
//     gender:    { type: String , required: true},
//     address:   { type: String },
//     phone:     { type: String },
//     email:     { type: String, required: true, unique: true },
//     password:  { type: String, required: true },
//     // For photos, you can store a URL/path to an image or a buffer
// photo:     { type: String }, // or { type: Buffer } for binary data
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('User', userSchema);

// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  password: { type: String, required: true },
  iv: { type: String },
  preferences: {
    maxDistance: { type: Number, default: 50 },
    extenedDistanceSearch: { type: Boolean, default: false },
    likesnmatches: { type: Boolean, default: true },
    newMssgs: { type: Boolean, default: true },
    foundPetAlert: { type: Boolean, default: true },
    likesNotifications: { type: Boolean, default: true },
    commentsNotifications: { type: Boolean, default: true },
    postsReco: { type: Boolean, default: true },
  },
  pets: [{ type: String, required: true }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

const crypto = require("crypto");

const secretKey =
  process.env.ENCRYPTION_SECRET || "default_secret_key_32_characters"; // 32 characters for AES-256
const iv = crypto.randomBytes(16); // Initialization vector

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "utf8"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}

function decrypt(encryptedContent, ivString) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "utf8"),
    Buffer.from(ivString, "hex")
  );
  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = encrypt(this.password);

  // this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
