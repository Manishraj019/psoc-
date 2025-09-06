const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import models
const Admin = require('../models/Admin');
const Team = require('../models/Team');
const Level = require('../models/Level');
const GameState = require('../models/GameState');

// Load environment variables
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo-marathon';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const admin = new Admin({
      username: 'admin',
      passwordHash: 'admin@123' // Will be hashed by pre-save middleware
    });

    await admin.save();
    console.log('👤 Admin user created successfully');
    console.log('   Username: admin');
    console.log('   Password: admin@123');
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
};

const createSampleTeams = async () => {
  try {
    const sampleTeams = [
      {
        teamName: 'shutters',
        password: 'secret123',
        leader: {
          name: 'Aman Singh',
          contact: '9876543210',
          rollNo: '21CS001'
        },
        members: [
          { name: 'Ravi Kumar', rollNo: '21CS002' },
          { name: 'Nisha Patel', rollNo: '21CS003' }
        ]
      },
      {
        teamName: 'pixelpioneers',
        password: 'secret123',
        leader: {
          name: 'Priya Sharma',
          contact: '9876543211',
          rollNo: '21CS004'
        },
        members: [
          { name: 'Arjun Mehta', rollNo: '21CS005' },
          { name: 'Sneha Gupta', rollNo: '21CS006' }
        ]
      },
      {
        teamName: 'framemakers',
        password: 'secret123',
        leader: {
          name: 'Vikram Joshi',
          contact: '9876543212',
          rollNo: '21CS007'
        },
        members: [
          { name: 'Anita Reddy', rollNo: '21CS008' },
          { name: 'Rohit Agarwal', rollNo: '21CS009' }
        ]
      },
      {
        teamName: 'snapsquad',
        password: 'secret123',
        leader: {
          name: 'Deepika Nair',
          contact: '9876543213',
          rollNo: '21CS010'
        },
        members: [
          { name: 'Karan Malhotra', rollNo: '21CS011' },
          { name: 'Pooja Iyer', rollNo: '21CS012' }
        ]
      },
      {
        teamName: 'apertureallies',
        password: 'secret123',
        leader: {
          name: 'Rajesh Verma',
          contact: '9876543214',
          rollNo: '21CS013'
        },
        members: [
          { name: 'Sunita Das', rollNo: '21CS014' },
          { name: 'Manoj Tiwari', rollNo: '21CS015' }
        ]
      }
    ];

    const createdTeams = [];
    
    for (const teamData of sampleTeams) {
      // Check if team already exists
      const existingTeam = await Team.findOne({ teamName: teamData.teamName });
      if (existingTeam) {
        console.log(`👥 Team ${teamData.teamName} already exists`);
        createdTeams.push(existingTeam);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(teamData.password, salt);

      // Create team
      const team = new Team({
        teamName: teamData.teamName,
        passwordHash,
        leader: teamData.leader,
        members: teamData.members,
        currentLevel: 1
      });

      await team.save();
      createdTeams.push(team);
      console.log(`👥 Team ${teamData.teamName} created successfully`);
    }

    return createdTeams;
  } catch (error) {
    console.error('❌ Error creating sample teams:', error);
    throw error;
  }
};

const createSampleLevels = async () => {
  try {
    const sampleLevels = [
      {
        levelNumber: 1,
        isFinal: false,
        hint: 'Find a red door near the library building',
        description: 'Look for a distinctive red door in the campus library area',
        imagesPool: [
          {
            url: '/uploads/sample/L1_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L1_img1.jpg',
              originalName: 'red_door_library.jpg'
            }
          },
          {
            url: '/uploads/sample/L1_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L1_img2.jpg',
              originalName: 'red_door_entrance.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 2,
        isFinal: false,
        hint: 'Capture a statue with a raised hand',
        description: 'Find any statue on campus where the figure has one hand raised',
        imagesPool: [
          {
            url: '/uploads/sample/L2_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L2_img1.jpg',
              originalName: 'statue_raised_hand.jpg'
            }
          },
          {
            url: '/uploads/sample/L2_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L2_img2.jpg',
              originalName: 'monument_gesture.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 3,
        isFinal: false,
        hint: 'Find a clock tower or large clock',
        description: 'Look for any prominent clock on campus buildings',
        imagesPool: [
          {
            url: '/uploads/sample/L3_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L3_img1.jpg',
              originalName: 'clock_tower.jpg'
            }
          },
          {
            url: '/uploads/sample/L3_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L3_img2.jpg',
              originalName: 'building_clock.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 4,
        isFinal: false,
        hint: 'Capture a fountain or water feature',
        description: 'Find any decorative fountain or water element on campus',
        imagesPool: [
          {
            url: '/uploads/sample/L4_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L4_img1.jpg',
              originalName: 'campus_fountain.jpg'
            }
          },
          {
            url: '/uploads/sample/L4_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L4_img2.jpg',
              originalName: 'water_feature.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 5,
        isFinal: false,
        hint: 'Find a bench under a tree',
        description: 'Look for seating areas with trees providing shade',
        imagesPool: [
          {
            url: '/uploads/sample/L5_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L5_img1.jpg',
              originalName: 'bench_tree.jpg'
            }
          },
          {
            url: '/uploads/sample/L5_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L5_img2.jpg',
              originalName: 'shaded_seating.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 6,
        isFinal: false,
        hint: 'Capture a staircase with more than 10 steps',
        description: 'Find any prominent staircase on campus buildings',
        imagesPool: [
          {
            url: '/uploads/sample/L6_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L6_img1.jpg',
              originalName: 'main_staircase.jpg'
            }
          },
          {
            url: '/uploads/sample/L6_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L6_img2.jpg',
              originalName: 'building_steps.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 7,
        isFinal: false,
        hint: 'Find a flagpole with a flag',
        description: 'Look for any flagpole displaying a flag on campus',
        imagesPool: [
          {
            url: '/uploads/sample/L7_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L7_img1.jpg',
              originalName: 'flagpole_main.jpg'
            }
          },
          {
            url: '/uploads/sample/L7_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L7_img2.jpg',
              originalName: 'campus_flag.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 8,
        isFinal: false,
        hint: 'Capture a garden or flower bed',
        description: 'Find any landscaped garden area with flowers or plants',
        imagesPool: [
          {
            url: '/uploads/sample/L8_img1.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L8_img1.jpg',
              originalName: 'campus_garden.jpg'
            }
          },
          {
            url: '/uploads/sample/L8_img2.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'L8_img2.jpg',
              originalName: 'flower_bed.jpg'
            }
          }
        ]
      },
      {
        levelNumber: 9,
        isFinal: true,
        hint: 'The finishing shot - capture the main campus entrance',
        description: 'This is the final level. Find the main entrance to the campus.',
        imagesPool: [
          {
            url: '/uploads/sample/final.jpg',
            metadata: {
              uploader: 'admin',
              filename: 'final.jpg',
              originalName: 'main_entrance.jpg'
            }
          }
        ]
      }
    ];

    const createdLevels = [];
    
    for (const levelData of sampleLevels) {
      // Check if level already exists
      const existingLevel = await Level.findOne({ levelNumber: levelData.levelNumber });
      if (existingLevel) {
        console.log(`🎯 Level ${levelData.levelNumber} already exists`);
        createdLevels.push(existingLevel);
        continue;
      }

      // Create level
      const level = new Level(levelData);
      await level.save();
      createdLevels.push(level);
      console.log(`🎯 Level ${levelData.levelNumber} created successfully`);
    }

    return createdLevels;
  } catch (error) {
    console.error('❌ Error creating sample levels:', error);
    throw error;
  }
};

const createGameState = async () => {
  try {
    const existingGameState = await GameState.findOne();
    if (existingGameState) {
      console.log('🎮 Game state already exists');
      return existingGameState;
    }

    const gameState = new GameState({
      isRunning: false,
      startedAt: null,
      pausedAt: null,
      winnerTeamId: null,
      winnerDeclaredAt: null
    });

    await gameState.save();
    console.log('🎮 Game state created successfully');
    return gameState;
  } catch (error) {
    console.error('❌ Error creating game state:', error);
    throw error;
  }
};

const createSampleDirectories = () => {
  try {
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const sampleDir = path.join(uploadsDir, 'sample');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory');
    }
    
    if (!fs.existsSync(sampleDir)) {
      fs.mkdirSync(sampleDir, { recursive: true });
      console.log('📁 Created sample images directory');
    }
    
    console.log('📁 Note: Please add sample images to the uploads/sample/ directory');
    console.log('   Expected files: L1_img1.jpg, L1_img2.jpg, ..., L8_img2.jpg, final.jpg');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Create directories
    createSampleDirectories();
    
    // Create admin user
    await createAdmin();
    console.log('');
    
    // Create sample teams
    await createSampleTeams();
    console.log('');
    
    // Create sample levels
    await createSampleLevels();
    console.log('');
    
    // Create game state
    await createGameState();
    console.log('');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   👤 Admin user: admin / admin@123');
    console.log('   👥 5 sample teams created');
    console.log('   🎯 9 levels created (8 random + 1 final)');
    console.log('   🎮 Game state initialized');
    console.log('\n🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
