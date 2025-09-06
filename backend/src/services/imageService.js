const cv = require('opencv4nodejs');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageSimilarityService {
  constructor() {
    this.method = process.env.OPENCV_METHOD || 'orb';
    this.threshold = parseFloat(process.env.AUTO_APPROVAL_THRESHOLD) || 75;
  }

  /**
   * Calculate similarity between two images
   * @param {string} imagePath1 - Path to reference image
   * @param {string} imagePath2 - Path to submitted image
   * @returns {Promise<number>} Similarity score (0-100)
   */
  async calculateSimilarity(imagePath1, imagePath2) {
    try {
      // Preprocess images
      const processedImage1 = await this.preprocessImage(imagePath1);
      const processedImage2 = await this.preprocessImage(imagePath2);

      let similarity = 0;

      if (this.method === 'orb') {
        similarity = await this.calculateORBSimilarity(processedImage1, processedImage2);
      } else if (this.method === 'phash') {
        similarity = await this.calculatePHashSimilarity(processedImage1, processedImage2);
      } else {
        // Default to ORB
        similarity = await this.calculateORBSimilarity(processedImage1, processedImage2);
      }

      // If ORB returns very low score, try pHash as fallback
      if (this.method === 'orb' && similarity < 20) {
        const phashScore = await this.calculatePHashSimilarity(processedImage1, processedImage2);
        if (phashScore > similarity) {
          similarity = phashScore;
        }
      }

      return Math.min(100, Math.max(0, similarity));
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  /**
   * Preprocess image for better feature detection
   */
  async preprocessImage(imagePath) {
    try {
      // Use sharp to resize and optimize image
      const processedBuffer = await sharp(imagePath)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .grayscale()
        .jpeg({ quality: 90 })
        .toBuffer();

      // Convert to OpenCV Mat
      const mat = cv.imdecode(processedBuffer);
      return mat;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity using ORB feature matching
   */
  async calculateORBSimilarity(mat1, mat2) {
    try {
      // Create ORB detector
      const orb = new cv.ORBDetector(500);
      
      // Detect keypoints and compute descriptors
      const keypoints1 = orb.detect(mat1);
      const keypoints2 = orb.detect(mat2);
      
      if (keypoints1.length < 10 || keypoints2.length < 10) {
        return 0; // Not enough features
      }

      const descriptors1 = orb.compute(mat1, keypoints1);
      const descriptors2 = orb.compute(mat2, keypoints2);

      // Use FLANN matcher
      const flann = new cv.FlannBasedMatcher();
      const matches = flann.knnMatch(descriptors1, descriptors2, 2);

      // Apply Lowe's ratio test
      const goodMatches = [];
      const ratio = 0.75;

      for (let i = 0; i < matches.length; i++) {
        if (matches[i].length === 2) {
          const match1 = matches[i][0];
          const match2 = matches[i][1];
          
          if (match1.distance < ratio * match2.distance) {
            goodMatches.push(match1);
          }
        }
      }

      // Calculate similarity score
      const similarity = (goodMatches.length / Math.max(keypoints1.length, keypoints2.length)) * 100;
      return similarity;
    } catch (error) {
      console.error('Error in ORB similarity calculation:', error);
      return 0;
    }
  }

  /**
   * Calculate similarity using perceptual hash
   */
  async calculatePHashSimilarity(mat1, mat2) {
    try {
      // Convert to 8x8 grayscale
      const hash1 = this.calculatePHash(mat1);
      const hash2 = this.calculatePHash(mat2);

      // Calculate Hamming distance
      const hammingDistance = this.hammingDistance(hash1, hash2);
      
      // Convert to similarity percentage (0-100)
      const similarity = Math.max(0, 100 - (hammingDistance * 100 / 64));
      return similarity;
    } catch (error) {
      console.error('Error in pHash similarity calculation:', error);
      return 0;
    }
  }

  /**
   * Calculate perceptual hash for an image
   */
  calculatePHash(mat) {
    // Resize to 8x8
    const resized = mat.resize(8, 8);
    
    // Convert to grayscale if not already
    let gray = resized;
    if (resized.channels > 1) {
      gray = resized.cvtColor(cv.COLOR_BGR2GRAY);
    }

    // Calculate average
    const mean = gray.mean();
    
    // Create hash
    let hash = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const pixel = gray.at(i, j);
        if (pixel > mean) {
          hash |= (1 << (i * 8 + j));
        }
      }
    }
    
    return hash;
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
      method: this.method,
      threshold: this.threshold
    };
  }
}

module.exports = new ImageSimilarityService();
