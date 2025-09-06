const Level = require('../models/Level');
const Submission = require('../models/Submission');
const GameState = require('../models/GameState');
const assignmentService = require('../services/assignmentService');
const rankingService = require('../services/rankingService');
const socketService = require('../services/socketService');

class AdminController {
  /**
   * Get all levels
   */
  async getLevels(req, res) {
    try {
      const levels = await Level.find({}).sort({ levelNumber: 1 });
      res.json(levels);
    } catch (error) {
      console.error('Get levels error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create a new level
   */
  async createLevel(req, res) {
    try {
      const { levelNumber, isFinal, hint, description } = req.body;
      const files = req.files;

      if (!levelNumber || !hint) {
        return res.status(400).json({ error: 'Level number and hint are required' });
      }

      // Check if level already exists
      const existingLevel = await Level.findOne({ levelNumber });
      if (existingLevel) {
        return res.status(409).json({ error: `Level ${levelNumber} already exists` });
      }

      // Process uploaded images
      const imagesPool = [];
      if (files && files.length > 0) {
        for (const file of files) {
          imagesPool.push({
            url: file.path,
            metadata: {
              uploader: req.user.username,
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype
            }
          });
        }
      }

      const level = new Level({
        levelNumber,
        isFinal: isFinal === 'true' || isFinal === true,
        hint,
        description: description || '',
        imagesPool
      });

      await level.save();

      res.status(201).json(level);
    } catch (error) {
      console.error('Create level error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Level number already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update a level
   */
  async updateLevel(req, res) {
    try {
      const { id } = req.params;
      const { hint, description, isFinal } = req.body;
      const files = req.files;

      const level = await Level.findById(id);
      if (!level) {
        return res.status(404).json({ error: 'Level not found' });
      }

      // Update fields
      if (hint !== undefined) level.hint = hint;
      if (description !== undefined) level.description = description;
      if (isFinal !== undefined) level.isFinal = isFinal === 'true' || isFinal === true;

      // Add new images if provided
      if (files && files.length > 0) {
        for (const file of files) {
          level.imagesPool.push({
            url: file.path,
            metadata: {
              uploader: req.user.username,
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype
            }
          });
        }
      }

      await level.save();
      res.json(level);
    } catch (error) {
      console.error('Update level error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete a level
   */
  async deleteLevel(req, res) {
    try {
      const { id } = req.params;

      const level = await Level.findById(id);
      if (!level) {
        return res.status(404).json({ error: 'Level not found' });
      }

      await Level.findByIdAndDelete(id);
      res.json({ message: 'Level deleted successfully' });
    } catch (error) {
      console.error('Delete level error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get pending submissions
   */
  async getPendingSubmissions(req, res) {
    try {
      const submissions = await Submission.find({ status: 'pending' })
        .populate('teamId', 'teamName leader members')
        .populate('assignedImageId')
        .sort({ submittedAt: -1 });

      res.json(submissions);
    } catch (error) {
      console.error('Get pending submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Approve a submission
   */
  async approveSubmission(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const submission = await Submission.findById(id)
        .populate('teamId')
        .populate('assignedImageId');

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({ error: 'Submission is not pending' });
      }

      // Update submission
      submission.status = 'approved';
      submission.autoDecision = false;
      submission.reviewer = {
        adminId: req.user._id,
        reason: reason || 'Approved by admin',
        reviewedAt: new Date()
      };

      await submission.save();

      // Update team progress
      const team = submission.teamId;
      const levelNumber = submission.levelNumber;

      // Add to completed levels if not already there
      const existingCompletion = team.completedLevels.find(
        level => level.levelNumber === levelNumber
      );

      if (!existingCompletion) {
        team.completedLevels.push({
          levelNumber,
          completedAt: new Date()
        });
      }

      // Check if this was the final level
      if (levelNumber === 9) {
        // Check if this team is the winner
        const isWinner = await rankingService.checkWinner(team._id);
        if (isWinner) {
          const gameState = await GameState.getCurrentGameState();
          if (!gameState.winnerTeamId) {
            gameState.winnerTeamId = team._id;
            gameState.winnerDeclaredAt = new Date();
            await gameState.save();

            // Emit winner announcement
            socketService.emitWinnerAnnouncement({
              teamId: team._id,
              teamName: team.teamName,
              completedAt: new Date()
            });
          }
        }
      } else {
        // Assign next level
        await assignmentService.assignNextLevel(team._id);
      }

      await team.save();

      // Emit events
      socketService.emitSubmissionReviewed(team._id, {
        submissionId: submission._id,
        status: 'approved',
        levelNumber,
        reviewer: req.user.username,
        reason: submission.reviewer.reason
      });

      // Update leaderboard
      const leaderboard = await rankingService.calculateLeaderboard();
      socketService.emitLeaderboardUpdate(leaderboard);

      res.json({
        message: 'Submission approved successfully',
        submission: {
          id: submission._id,
          status: submission.status,
          levelNumber: submission.levelNumber,
          teamName: team.teamName
        }
      });
    } catch (error) {
      console.error('Approve submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Reject a submission
   */
  async rejectSubmission(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const submission = await Submission.findById(id)
        .populate('teamId');

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({ error: 'Submission is not pending' });
      }

      // Update submission
      submission.status = 'rejected';
      submission.autoDecision = false;
      submission.reviewer = {
        adminId: req.user._id,
        reason: reason || 'Rejected by admin',
        reviewedAt: new Date()
      };

      await submission.save();

      // Emit event
      socketService.emitSubmissionReviewed(submission.teamId._id, {
        submissionId: submission._id,
        status: 'rejected',
        levelNumber: submission.levelNumber,
        reviewer: req.user.username,
        reason: submission.reviewer.reason
      });

      res.json({
        message: 'Submission rejected successfully',
        submission: {
          id: submission._id,
          status: submission.status,
          levelNumber: submission.levelNumber,
          teamName: submission.teamId.teamName
        }
      });
    } catch (error) {
      console.error('Reject submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const leaderboard = await rankingService.calculateLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Start the game
   */
  async startGame(req, res) {
    try {
      // Validate that all levels have images
      const validation = await assignmentService.validateLevelAssignments();
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Cannot start game',
          issues: validation.issues
        });
      }

      const gameState = await GameState.getCurrentGameState();
      gameState.isRunning = true;
      gameState.startedAt = new Date();
      gameState.pausedAt = null;
      gameState.winnerTeamId = null;
      gameState.winnerDeclaredAt = null;

      await gameState.save();

      // Emit game started event
      socketService.emitGameStateChange('started', {
        startedAt: gameState.startedAt
      });

      res.json({
        message: 'Game started successfully',
        gameState: {
          isRunning: gameState.isRunning,
          startedAt: gameState.startedAt
        }
      });
    } catch (error) {
      console.error('Start game error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pause the game
   */
  async pauseGame(req, res) {
    try {
      const gameState = await GameState.getCurrentGameState();
      gameState.isRunning = false;
      gameState.pausedAt = new Date();

      await gameState.save();

      // Emit game paused event
      socketService.emitGameStateChange('paused', {
        pausedAt: gameState.pausedAt
      });

      res.json({
        message: 'Game paused successfully',
        gameState: {
          isRunning: gameState.isRunning,
          pausedAt: gameState.pausedAt
        }
      });
    } catch (error) {
      console.error('Pause game error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Reset the game
   */
  async resetGame(req, res) {
    try {
      const gameState = await GameState.getCurrentGameState();
      gameState.isRunning = false;
      gameState.startedAt = null;
      gameState.pausedAt = null;
      gameState.winnerTeamId = null;
      gameState.winnerDeclaredAt = null;

      await gameState.save();

      // Reset all teams
      const Team = require('../models/Team');
      await Team.updateMany({}, {
        currentLevel: 1,
        assignedImages: [],
        completedLevels: [],
        lastSubmissionAt: null
      });

      // Clear all submissions
      await Submission.deleteMany({});

      // Emit game reset event
      socketService.emitGameStateChange('reset', {
        resetAt: new Date()
      });

      res.json({
        message: 'Game reset successfully',
        gameState: {
          isRunning: gameState.isRunning,
          startedAt: gameState.startedAt
        }
      });
    } catch (error) {
      console.error('Reset game error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get game state
   */
  async getGameState(req, res) {
    try {
      const gameState = await GameState.getCurrentGameState();
      res.json(gameState);
    } catch (error) {
      console.error('Get game state error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AdminController();
