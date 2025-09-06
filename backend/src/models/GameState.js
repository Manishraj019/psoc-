const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  isRunning: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date
  },
  pausedAt: {
    type: Date
  },
  winnerTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  winnerDeclaredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure only one game state document exists
gameStateSchema.statics.getCurrentGameState = async function() {
  let gameState = await this.findOne();
  if (!gameState) {
    gameState = new this();
    await gameState.save();
  }
  return gameState;
};

module.exports = mongoose.model('GameState', gameStateSchema);
