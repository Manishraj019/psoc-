const mongoose = require('mongoose');

const levelImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  metadata: {
    uploader: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    size: Number,
    mimeType: String
  }
});

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 9
  },
  isFinal: {
    type: Boolean,
    default: false
  },
  hint: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imagesPool: [levelImageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
levelSchema.index({ levelNumber: 1 });
levelSchema.index({ isFinal: 1 });

module.exports = mongoose.model('Level', levelSchema);
