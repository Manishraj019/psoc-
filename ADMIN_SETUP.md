# Admin Setup Guide

## Quick Admin User Creation

### 1. Create Admin User
```bash
cd backend
npm run seed:admin
```

### 2. Test Admin Login
```bash
npm run test:admin
```

### 3. Admin Credentials
- **Username**: `admin`
- **Password**: `admin@123`

## What the Seeder Does

1. **Connects** to your MongoDB database
2. **Checks** if admin user already exists
3. **Creates** admin user with hashed password if not exists
4. **Displays** success message with credentials
5. **Closes** database connection

## Environment Setup

Make sure you have your MongoDB connection string in your `.env` file:

```env
MONGO_URI=mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## Usage Examples

### Local Development
```bash
# 1. Start your backend server
npm run dev

# 2. Create admin user
npm run seed:admin

# 3. Test login
npm run test:admin

# 4. Login to admin dashboard
# Go to: http://localhost:3000/admin/login
# Username: admin
# Password: admin@123
```

### Production Deployment
```bash
# 1. Deploy your backend
# 2. Run admin seeder on production server
npm run seed:admin

# 3. Verify admin login works
npm run test:admin
```

## Security Notes

- ✅ Password is hashed with bcrypt (12 salt rounds)
- ✅ Admin credentials are only displayed during setup
- ⚠️ **Change default password after first login in production**
- ⚠️ **Use strong JWT_SECRET in production**

## Troubleshooting

### Admin user already exists
```
⚠️  Admin user already exists
Username: admin
Password: admin@123
```
**Solution**: Admin is already created, you can proceed with login.

### Database connection error
```
❌ Error seeding admin: MongoNetworkError
```
**Solution**: Check your `MONGO_URI` in `.env` file and network connectivity.

### Password verification failed
```
❌ Password verification failed
```
**Solution**: Re-run the seeder: `npm run seed:admin`

## Files Created

- `backend/src/scripts/adminSeeder.js` - Main seeder script
- `backend/src/scripts/testAdminLogin.js` - Login test script
- `backend/src/scripts/README.md` - Detailed documentation

## Next Steps

After creating the admin user:

1. **Login** to admin dashboard
2. **Create levels** with reference images
3. **Start the game** for teams to register
4. **Monitor submissions** and approve/reject photos
5. **View leaderboard** to track team progress

Your Photo Marathon platform is ready to go! 🎉
