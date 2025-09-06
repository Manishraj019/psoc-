const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  }
});

const assignedImageSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 9
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LevelImage',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

const completedLevelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 9
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeTakenMs: {
    type: Number,
    default: 0
  }
});

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  leader: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      required: true,
      trim: true
    },
    rollNo: {
      type: String,
      required: true,
      trim: true
    }
  },
  members: [memberSchema],
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 9
  },
  assignedImages: [assignedImageSchema],
  completedLevels: [completedLevelSchema],
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastSubmissionAt: {
    type: Date
  }
});

// Index for efficient queries
teamSchema.index({ teamName: 1 });
teamSchema.index({ currentLevel: 1 });
teamSchema.index({ 'completedLevels.levelNumber': 1 });

module.exports = mongoose.model('Team', teamSchema);
