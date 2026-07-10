const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  settings: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'English' },
    model: { type: String, default: 'AlphaGPT-4' },
    systemPrompt: { type: String, default: '' },
    memoryEnabled: { type: Boolean, default: true }
  },
  subscription: {
    plan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    expiresAt: { type: Date, default: null }
  },
  googleId: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
