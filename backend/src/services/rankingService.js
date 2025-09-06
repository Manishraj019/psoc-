const Team = require('../models/Team');
const Submission = require('../models/Submission');

class RankingService {
  /**
   * Calculate leaderboard with teams ranked by level completion and time
   * @returns {Promise<Array>} Sorted leaderboard array
   */
  async calculateLeaderboard() {
    try {
      const teams = await Team.find({})
        .populate('completedLevels')
        .sort({ currentLevel: -1, 'completedLevels.completedAt': 1 });

      const leaderboard = [];

      for (const team of teams) {
        const teamStats = await this.calculateTeamStats(team);
        leaderboard.push(teamStats);
      }

      // Sort by level completed (desc), then by total time (asc)
      leaderboard.sort((a, b) => {
        if (a.levelCompleted !== b.levelCompleted) {
          return b.levelCompleted - a.levelCompleted;
        }
        return a.totalTimeMs - b.totalTimeMs;
      });

      return leaderboard;
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Calculate statistics for a single team
   * @param {Object} team - Team document
   * @returns {Promise<Object>} Team statistics
   */
  async calculateTeamStats(team) {
    try {
      const completedLevels = team.completedLevels || [];
      const levelCompleted = completedLevels.length;
      
      // Calculate total time from first submission to last completion
      let totalTimeMs = 0;
      let firstSubmissionAt = null;
      let lastCompletionAt = null;

      if (completedLevels.length > 0) {
        // Get first submission time
        const firstSubmission = await Submission.findOne({ teamId: team._id })
          .sort({ submittedAt: 1 });
        
        if (firstSubmission) {
          firstSubmissionAt = firstSubmission.submittedAt;
        }

        // Get last completion time
        const sortedCompletions = completedLevels.sort((a, b) => 
          new Date(b.completedAt) - new Date(a.completedAt)
        );
        lastCompletionAt = sortedCompletions[0].completedAt;

        // Calculate total time
        if (firstSubmissionAt && lastCompletionAt) {
          totalTimeMs = new Date(lastCompletionAt) - new Date(firstSubmissionAt);
        }
      }

      return {
        teamId: team._id,
        teamName: team.teamName,
        levelCompleted,
        completedAt: lastCompletionAt,
        totalTimeMs,
        totalTimeFormatted: this.formatTime(totalTimeMs),
        currentLevel: team.currentLevel,
        leader: team.leader,
        members: team.members
      };
    } catch (error) {
      console.error('Error calculating team stats:', error);
      throw error;
    }
  }

  /**
   * Check if a team has won (completed final level)
   * @param {string} teamId - Team ID
   * @returns {Promise<boolean>} Whether team has won
   */
  async checkWinner(teamId) {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        return false;
      }

      // Check if team has completed level 9
      const hasCompletedFinal = team.completedLevels.some(
        level => level.levelNumber === 9
      );

      return hasCompletedFinal;
    } catch (error) {
      console.error('Error checking winner:', error);
      return false;
    }
  }

  /**
   * Get the current winner (first team to complete final level)
   * @returns {Promise<Object|null>} Winner team or null
   */
  async getCurrentWinner() {
    try {
      const teams = await Team.find({});
      let winner = null;
      let earliestCompletion = null;

      for (const team of teams) {
        const finalLevelCompletion = team.completedLevels.find(
          level => level.levelNumber === 9
        );

        if (finalLevelCompletion) {
          if (!earliestCompletion || 
              new Date(finalLevelCompletion.completedAt) < new Date(earliestCompletion)) {
            earliestCompletion = finalLevelCompletion.completedAt;
            winner = team;
          }
        }
      }

      return winner;
    } catch (error) {
      console.error('Error getting current winner:', error);
      return null;
    }
  }

  /**
   * Format time in milliseconds to human readable format
   * @param {number} timeMs - Time in milliseconds
   * @returns {string} Formatted time string
   */
  formatTime(timeMs) {
    if (!timeMs || timeMs < 0) {
      return '00:00:00';
    }

    const hours = Math.floor(timeMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get team's rank in leaderboard
   * @param {string} teamId - Team ID
   * @returns {Promise<number>} Team's rank (1-based)
   */
  async getTeamRank(teamId) {
    try {
      const leaderboard = await this.calculateLeaderboard();
      const rank = leaderboard.findIndex(team => team.teamId.toString() === teamId.toString());
      return rank >= 0 ? rank + 1 : -1;
    } catch (error) {
      console.error('Error getting team rank:', error);
      return -1;
    }
  }

  /**
   * Get top N teams from leaderboard
   * @param {number} limit - Number of top teams to return
   * @returns {Promise<Array>} Top teams array
   */
  async getTopTeams(limit = 10) {
    try {
      const leaderboard = await this.calculateLeaderboard();
      return leaderboard.slice(0, limit);
    } catch (error) {
      console.error('Error getting top teams:', error);
      return [];
    }
  }
}

module.exports = new RankingService();
