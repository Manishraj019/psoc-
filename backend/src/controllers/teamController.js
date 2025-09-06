const Submission = require('../models/Submission');
const assignmentService = require('../services/assignmentService');
const imageService = require('../services/imageServiceSimple');
const socketService = require('../services/socketService');

class TeamController {
  /**
   * Get team's current progress
   */
  async getProgress(req, res) {
    try {
      const teamId = req.user._id;
      const progress = await assignmentService.getTeamProgress(teamId);
      res.json(progress);
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Submit an image for current level
   */
  async submitImage(req, res) {
    try {
      const teamId = req.user._id;
      const team = req.user;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Get team's current level and assigned image
      const progress = await assignmentService.getTeamProgress(teamId);
      if (!progress.assignedImage) {
        return res.status(400).json({ error: 'No assigned image for current level' });
      }

      // Check if team has already submitted for this level
      const existingSubmission = await Submission.findOne({
        teamId,
        levelNumber: progress.currentLevel,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingSubmission) {
        return res.status(400).json({ 
          error: 'You have already submitted for this level',
          existingSubmission: {
            id: existingSubmission._id,
            status: existingSubmission.status,
            submittedAt: existingSubmission.submittedAt
          }
        });
      }

      // Calculate image similarity
      const similarityScore = await imageService.calculateSimilarity(
        progress.assignedImage.url,
        file.path
      );

      // Create submission record
      const submission = new Submission({
        teamId,
        levelNumber: progress.currentLevel,
        assignedImageId: progress.assignedImage.imageId,
        submittedImageUrl: file.path,
        similarityScore,
        status: 'pending',
        autoDecision: false
      });

      // Check if should auto-approve
      if (imageService.shouldAutoApprove(similarityScore)) {
        submission.status = 'approved';
        submission.autoDecision = true;

        // Update team progress
        const team = await require('../models/Team').findById(teamId);
        
        // Add to completed levels
        team.completedLevels.push({
          levelNumber: progress.currentLevel,
          completedAt: new Date()
        });

        // Check if this was the final level
        if (progress.currentLevel === 9) {
          // Check if this team is the winner
          const rankingService = require('../services/rankingService');
          const isWinner = await rankingService.checkWinner(teamId);
          if (isWinner) {
            const GameState = require('../models/GameState');
            const gameState = await GameState.getCurrentGameState();
            if (!gameState.winnerTeamId) {
              gameState.winnerTeamId = teamId;
              gameState.winnerDeclaredAt = new Date();
              await gameState.save();

              // Emit winner announcement
              socketService.emitWinnerAnnouncement({
                teamId,
                teamName: team.teamName,
                completedAt: new Date()
              });
            }
          }
        } else {
          // Assign next level
          await assignmentService.assignNextLevel(teamId);
        }

        team.lastSubmissionAt = new Date();
        await team.save();

        // Emit events
        socketService.emitSubmissionResult(teamId, {
          teamName: team.teamName,
          levelNumber: progress.currentLevel,
          status: 'approved',
          similarityScore,
          nextLevelUnlocked: progress.currentLevel < 9
        });

        if (progress.currentLevel < 9) {
          socketService.emitLevelUnlocked(teamId, {
            nextLevelNumber: progress.currentLevel + 1
          });
        }

        // Update leaderboard
        const rankingService = require('../services/rankingService');
        const leaderboard = await rankingService.calculateLeaderboard();
        socketService.emitLeaderboardUpdate(leaderboard);

        await submission.save();

        res.json({
          status: 'approved',
          similarityScore,
          nextLevelUnlocked: progress.currentLevel < 9,
          nextLevelNumber: progress.currentLevel < 9 ? progress.currentLevel + 1 : null,
          message: progress.currentLevel === 9 ? 'Congratulations! You completed the final level!' : 'Great! You\'ve unlocked the next level.'
        });
      } else {
        // Send to admin for review
        await submission.save();

        // Emit pending submission to admin
        socketService.emitPendingSubmission({
          submissionId: submission._id,
          teamName: team.teamName,
          levelNumber: progress.currentLevel,
          similarityScore
        });

        // Emit result to team
        socketService.emitSubmissionResult(teamId, {
          teamName: team.teamName,
          levelNumber: progress.currentLevel,
          status: 'pending',
          similarityScore
        });

        res.json({
          status: 'pending',
          similarityScore,
          message: 'Sent to admin for manual review'
        });
      }
    } catch (error) {
      console.error('Submit image error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get team's submission history
   */
  async getSubmissionHistory(req, res) {
    try {
      const teamId = req.user._id;
      const submissions = await Submission.find({ teamId })
        .populate('assignedImageId')
        .sort({ submittedAt: -1 });

      res.json(submissions);
    } catch (error) {
      console.error('Get submission history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get team's current submission status
   */
  async getCurrentSubmissionStatus(req, res) {
    try {
      const teamId = req.user._id;
      const progress = await assignmentService.getTeamProgress(teamId);

      const currentSubmission = await Submission.findOne({
        teamId,
        levelNumber: progress.currentLevel
      }).sort({ submittedAt: -1 });

      res.json({
        currentLevel: progress.currentLevel,
        hasSubmission: !!currentSubmission,
        submission: currentSubmission ? {
          id: currentSubmission._id,
          status: currentSubmission.status,
          similarityScore: currentSubmission.similarityScore,
          submittedAt: currentSubmission.submittedAt,
          autoDecision: currentSubmission.autoDecision
        } : null
      });
    } catch (error) {
      console.error('Get current submission status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TeamController();
