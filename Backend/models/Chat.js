const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  attachments: [{
    name: String,
    url: String,
    type: { type: String } // e.g. 'image/png', 'application/pdf'
  }],
  likes: {
    type: Boolean, // true for like, false for dislike, undefined/null for neutral
    default: null
  },
  tokens: {
    type: Number,
    default: 0
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat',
  },
  model: {
    type: String,
    default: 'AlphaGPT-4',
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  folder: {
    type: String, // folders can be simple category tags/names
    default: null,
  },
  messages: [messageSchema],
  isShared: {
    type: Boolean,
    default: false,
  },
  shareId: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
