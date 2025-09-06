const Level = require('../models/Level');
const Team = require('../models/Team');

class AssignmentService {
  /**
   * Assign a random image from the level's pool to a team
   * @param {string} teamId - Team ID
   * @param {number} levelNumber - Level number (1-8)
   * @returns {Promise<Object>} Assigned image object
   */
  async assignRandomImage(teamId, levelNumber) {
    try {
      // Get the level
      const level = await Level.findOne({ levelNumber });
      if (!level) {
        throw new Error(`Level ${levelNumber} not found`);
      }

      // For final level (9), all teams get the same image
      if (levelNumber === 9 || level.isFinal) {
        if (level.imagesPool.length === 0) {
          throw new Error('No images available for final level');
        }
        // Use the first image for final level
        const assignedImage = level.imagesPool[0];
        return this.saveAssignment(teamId, levelNumber, assignedImage._id);
      }

      // For levels 1-8, assign random image from pool
      if (level.imagesPool.length === 0) {
        throw new Error(`No images available for level ${levelNumber}`);
      }

      // Get random image from pool
      const randomIndex = Math.floor(Math.random() * level.imagesPool.length);
      const assignedImage = level.imagesPool[randomIndex];

      return this.saveAssignment(teamId, levelNumber, assignedImage._id);
    } catch (error) {
      console.error('Error assigning random image:', error);
      throw error;
    }
  }

  /**
   * Save the assignment to team's assignedImages array
   */
  async saveAssignment(teamId, levelNumber, imageId) {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Check if already assigned for this level
      const existingAssignment = team.assignedImages.find(
        assignment => assignment.levelNumber === levelNumber
      );

      if (existingAssignment) {
        return existingAssignment;
      }

      // Add new assignment
      const newAssignment = {
        levelNumber,
        imageId,
        assignedAt: new Date()
      };

      team.assignedImages.push(newAssignment);
      await team.save();

      return newAssignment;
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error;
    }
  }

  /**
   * Get assigned image for a team at a specific level
   * @param {string} teamId - Team ID
   * @param {number} levelNumber - Level number
   * @returns {Promise<Object>} Assigned image with full details
   */
  async getAssignedImage(teamId, levelNumber) {
    try {
      const team = await Team.findById(teamId).populate('assignedImages.imageId');
      if (!team) {
        throw new Error('Team not found');
      }

      const assignment = team.assignedImages.find(
        assignment => assignment.levelNumber === levelNumber
      );

      if (!assignment) {
        throw new Error(`No assignment found for level ${levelNumber}`);
      }

      return assignment;
    } catch (error) {
      console.error('Error getting assigned image:', error);
      throw error;
    }
  }

  /**
   * Assign next level to team after completion
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Next level assignment
   */
  async assignNextLevel(teamId) {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const nextLevel = team.currentLevel + 1;
      
      // Check if team has reached max level
      if (nextLevel > 9) {
        throw new Error('Team has completed all levels');
      }

      // Assign random image for next level
      const assignment = await this.assignRandomImage(teamId, nextLevel);
      
      // Update team's current level
      team.currentLevel = nextLevel;
      await team.save();

      return {
        levelNumber: nextLevel,
        assignment
      };
    } catch (error) {
      console.error('Error assigning next level:', error);
      throw error;
    }
  }

  /**
   * Get team's current progress
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Team progress object
   */
  async getTeamProgress(teamId) {
    try {
      const team = await Team.findById(teamId).populate('assignedImages.imageId');
      if (!team) {
        throw new Error('Team not found');
      }

      // Get current level info
      const currentAssignment = team.assignedImages.find(
        assignment => assignment.levelNumber === team.currentLevel
      );

      const level = await Level.findOne({ levelNumber: team.currentLevel });

      return {
        currentLevel: team.currentLevel,
        assignedImage: currentAssignment ? {
          imageId: currentAssignment.imageId._id,
          url: currentAssignment.imageId.url,
          hint: level ? level.hint : '',
          description: level ? level.description : ''
        } : null,
        status: 'open',
        completedLevels: team.completedLevels.length,
        totalLevels: 9
      };
    } catch (error) {
      console.error('Error getting team progress:', error);
      throw error;
    }
  }

  /**
   * Check if all levels have sufficient images for assignment
   * @returns {Promise<Object>} Validation result
   */
  async validateLevelAssignments() {
    try {
      const levels = await Level.find({ levelNumber: { $lte: 8 } });
      const issues = [];

      for (const level of levels) {
        if (level.imagesPool.length < 1) {
          issues.push(`Level ${level.levelNumber} has no images in pool`);
        }
      }

      // Check final level
      const finalLevel = await Level.findOne({ levelNumber: 9 });
      if (!finalLevel || finalLevel.imagesPool.length === 0) {
        issues.push('Final level (9) has no images');
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating level assignments:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentService();
