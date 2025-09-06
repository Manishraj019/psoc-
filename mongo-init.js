// MongoDB initialization script
db = db.getSiblingDB('photo-marathon');

// Create collections with validation
db.createCollection('admins', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'passwordHash'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash must be a string and is required'
        }
      }
    }
  }
});

db.createCollection('teams', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['teamName', 'passwordHash', 'leader', 'members'],
      properties: {
        teamName: {
          bsonType: 'string',
          description: 'Team name must be a string and is required'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash must be a string and is required'
        },
        leader: {
          bsonType: 'object',
          required: ['name', 'contact', 'rollNo'],
          properties: {
            name: { bsonType: 'string' },
            contact: { bsonType: 'string' },
            rollNo: { bsonType: 'string' }
          }
        },
        members: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['name', 'rollNo'],
            properties: {
              name: { bsonType: 'string' },
              rollNo: { bsonType: 'string' }
            }
          }
        }
      }
    }
  }
});

db.createCollection('levels');
db.createCollection('submissions');
db.createCollection('gamestates');

// Create indexes for better performance
db.teams.createIndex({ teamName: 1 }, { unique: true });
db.teams.createIndex({ currentLevel: 1 });
db.teams.createIndex({ 'completedLevels.levelNumber': 1 });

db.levels.createIndex({ levelNumber: 1 }, { unique: true });
db.levels.createIndex({ isFinal: 1 });

db.submissions.createIndex({ teamId: 1, levelNumber: 1 });
db.submissions.createIndex({ status: 1 });
db.submissions.createIndex({ submittedAt: -1 });
db.submissions.createIndex({ similarityScore: -1 });

db.admins.createIndex({ username: 1 }, { unique: true });

print('Database initialized successfully!');
