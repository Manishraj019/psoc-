# Database Seeders

This directory contains scripts to seed the database with initial data.

## Admin Seeder

Creates the default admin user for the Photo Marathon platform.

### Usage

```bash
# Run the admin seeder
npm run seed:admin
```

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin@123`

### What it does:
1. Connects to MongoDB using the `MONGO_URI` environment variable
2. Checks if admin user already exists
3. If not exists, creates admin user with hashed password
4. Displays success message with credentials
5. Closes database connection

### Environment Variables Required:
```env
MONGO_URI=mongodb+srv://your-connection-string
```

### Full Seeder

For complete database setup with sample data:

```bash
# Run the full seeder (admin + sample levels + teams)
npm run seed
```

## Security Notes

- Password is hashed using bcrypt with 12 salt rounds
- Admin credentials are displayed in console for initial setup
- Change default password after first login in production
