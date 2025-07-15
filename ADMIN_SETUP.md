# ViralDeals Admin User Setup Guide

## 🎯 Quick Admin User Creation

This guide provides instructions for creating an admin user account for the ViralDeals application.

### 📋 Admin Credentials

**Default Admin User:**
- **Email**: `sanjay@admin.com`
- **Password**: `Ss@1234q`
- **Role**: `admin`

### 🚀 Local Development Setup

#### Method 1: Using NPM Script (Recommended)

```bash
# From project root
npm run create-admin

# Or from backend directory
cd backend
npm run create-admin
```

#### Method 2: Direct Script Execution

```bash
cd backend
node utils/createAdminUser.js
```

### 🌐 Production Deployment

#### For Vercel Deployment:

1. **Deploy the application** with the new admin creation script
2. **After deployment**, the admin user will be automatically available
3. **Login to admin panel** at: `https://your-app.vercel.app/admin`

#### Manual Admin Creation (if needed):

```bash
# Use the existing API endpoint
curl -X POST https://your-app.vercel.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "adminSecret": "viraldeals-admin-setup-2025",
    "name": "Sanjay Admin",
    "email": "sanjay@admin.com",
    "password": "Ss@1234q",
    "phone": "9123456789"
  }'
```

### 🔐 Admin Panel Access

1. **Navigate to login page**: `http://localhost:5173/login` (local) or `https://your-app.vercel.app/login` (production)
2. **Enter credentials**:
   - Email: `sanjay@admin.com`
   - Password: `Ss@1234q`
3. **Access admin dashboard**: After login, go to `/admin`

### ✅ Admin Features Available

- **Dashboard**: Overview of orders, users, and products
- **Product Management**: Add, edit, delete products
- **Order Management**: View and manage customer orders
- **User Management**: View and manage user accounts
- **Analytics**: View sales and user analytics
- **Settings**: Configure application settings
- **Product Scraper**: Import products from external sources

### 🛠️ Script Features

The `createAdminUser.js` script:
- ✅ Creates admin user if doesn't exist
- ✅ Updates existing admin user password if already exists
- ✅ Handles database connection automatically
- ✅ Provides clear success/error messages
- ✅ Lists all admin users after creation
- ✅ Safely closes database connection

### 🔧 Troubleshooting

#### Common Issues:

1. **Database Connection Error**
   - Ensure MongoDB is running (local) or connection string is correct (production)
   - Check environment variables in `.env` file

2. **User Already Exists**
   - Script will update existing user with new password
   - No action needed, credentials will work

3. **Permission Denied**
   - Ensure you have proper database permissions
   - Check MongoDB Atlas IP whitelist settings

#### Environment Variables Required:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 📞 Support

If you encounter any issues:
1. Check the console output for detailed error messages
2. Verify database connection
3. Ensure all environment variables are set correctly
4. Test login with provided credentials

---

**🎉 Once setup is complete, you can access the full admin panel with all management features!**
