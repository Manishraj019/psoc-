const mongoose = require('mongoose');

const reviewerSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
});

const submissionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 9
  },
  assignedImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LevelImage',
    required: true
  },
  submittedImageUrl: {
    type: String,
    required: true
  },
  similarityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  autoDecision: {
    type: Boolean,
    default: false
  },
  reviewer: reviewerSchema,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
submissionSchema.index({ teamId: 1, levelNumber: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ similarityScore: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
