const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      default: null 
    },
    password: { 
      type: String, 
      default: null 
    },
    deviceToken: { 
      type: String, 
      default: null 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    otp: { 
      type: String, 
      default: null 
    },
    otpExpiresAt: { 
      type: Date, 
      default: null 
    },
    status: { 
      type: String, 
      enum: ['active', 'suspended', 'deleted'], 
      default: 'active' 
    },
    name: { 
      type: String, 
      default: null 
    },
    profilePicture: { 
      type: String, 
      default: null 
    },
    token: { 
      type: String, 
      default: null  
    },
    role: { 
      type: String,
      enum: ['admin', 'vendor', 'customer'],
      default: 'customer'
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('User', userSchema);
