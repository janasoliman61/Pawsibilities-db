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
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
      userId: {type: Number,unique: true,},
      firstName: { type: String, required: true },
      lastName:  { type: String, required: true },
      userName:  { type: String, required: true, unique: true }, 
      gender:    { type: String , required: true},
      address:   { type: String },
      phone:     { type: String },
      email:     { type: String, required: true, unique: true },
      password:  { type: String, required: true },
      resetPasswordToken:   String,
      resetPasswordExpires: Date,

      twoFactorEnabled : {type : Boolean, default : false},
      twoFactorCode: {type : String, default : null},
      twoFactorCodeExpires: {type: Date, default: null}

});

userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
