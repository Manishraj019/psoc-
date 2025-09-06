const sharp = require('sharp');
const fs = require('fs');

class SimpleImageSimilarityService {
  constructor() {
    this.threshold = parseFloat(process.env.AUTO_APPROVAL_THRESHOLD) || 75;
  }

  /**
   * Calculate similarity between two images using perceptual hash
   * @param {string} imagePath1 - Path to reference image
   * @param {string} imagePath2 - Path to submitted image
   * @returns {Promise<number>} Similarity score (0-100)
   */
  async calculateSimilarity(imagePath1, imagePath2) {
    try {
      // Calculate perceptual hashes for both images
      const hash1 = await this.calculatePHash(imagePath1);
      const hash2 = await this.calculatePHash(imagePath2);

      // Calculate Hamming distance
      const hammingDistance = this.hammingDistance(hash1, hash2);
      
      // Convert to similarity percentage (0-100)
      const similarity = Math.max(0, 100 - (hammingDistance * 100 / 64));
      
      return Math.min(100, similarity);
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate perceptual hash for an image
   */
  async calculatePHash(imagePath) {
    try {
      // Resize to 8x8 and convert to grayscale
      const imageBuffer = await sharp(imagePath)
        .resize(8, 8)
        .grayscale()
        .raw()
        .toBuffer();

      // Calculate average
      let sum = 0;
      for (let i = 0; i < imageBuffer.length; i++) {
        sum += imageBuffer[i];
      }
      const average = sum / imageBuffer.length;
      
      // Create hash
      let hash = 0;
      for (let i = 0; i < imageBuffer.length; i++) {
        if (imageBuffer[i] > average) {
          hash |= (1 << i);
        }
      }
      
      return hash;
    } catch (error) {
      console.error('Error calculating pHash:', error);
      return 0;
    }
  }

  /**
   * Calculate Hamming distance between two hashes
   */
  hammingDistance(hash1, hash2) {
    let distance = 0;
    let xor = hash1 ^ hash2;
    
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
    
    return distance;
  }

  /**
   * Check if similarity score meets auto-approval threshold
   */
  shouldAutoApprove(similarityScore) {
    return similarityScore >= this.threshold;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      method: 'phash',
      threshold: this.threshold
    };
  }
}

module.exports = new SimpleImageSimilarityService();
