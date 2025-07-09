# ViralDeals.online Deployment Guide

## Vercel Deployment Instructions

### Prerequisites
- GitHub repository: https://github.com/itsmk42/viraldeals.online
- Vercel account
- MongoDB Atlas account (for production database)

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Create a new cluster (free tier is sufficient for testing)
   - Create a database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for all IPs)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/viraldeals`)

### Step 2: Vercel Deployment

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/
   - Click "New Project"
   - Import your GitHub repository: `itsmk42/viraldeals.online`

   **Note**: The project uses Vercel's serverless functions architecture with the API in the `/api` directory following Vercel conventions.

2. **Configure Build Settings**
   - Framework Preset: Other
   - Root Directory: Leave empty (uses root)
   - Build Command: Leave empty (uses vercel.json configuration)
   - Output Directory: Leave empty (uses vercel.json configuration)
   - Install Command: Leave empty (uses vercel.json configuration)

   **Note**: All build settings are now configured in `vercel.json` for consistency.

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:

   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=https://your-vercel-app-name.vercel.app
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

   **Important**: Replace the placeholder values with your actual credentials.

### Step 3: Post-Deployment Setup

1. **Seed Initial Data** (Optional)
   - The database will be empty initially
   - You can add products through the admin interface
   - Or run the seeder script if needed

2. **Create Admin User**
   - Register a new user through the frontend
   - Manually update the user's role to 'admin' in MongoDB Atlas
   - Or use the registration endpoint with admin credentials

3. **Test the Application**
   - Frontend: Your Vercel app URL
   - Backend API: Your Vercel app URL + `/api`
   - Admin Panel: Your Vercel app URL + `/admin`

### Step 4: Domain Configuration (Optional)

1. **Custom Domain**
   - In Vercel dashboard, go to your project settings
   - Add your custom domain (viraldeals.online)
   - Configure DNS records as instructed by Vercel

### Environment Variables Explained

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `FRONTEND_URL`: Your Vercel app URL (for CORS configuration)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For payment processing (get from Razorpay dashboard)

### Troubleshooting

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are properly listed in package.json
   - Verify environment variables are set correctly

2. **"No Output Directory named 'public' found" Error**
   - This is fixed by the `outputDirectory` setting in vercel.json
   - Vercel now looks for built files in `frontend/dist` instead of `public`
   - The build process creates files in the correct location

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes Vercel's IPs (or use 0.0.0.0/0)
   - Ensure database user has proper permissions

3. **API Endpoints Not Working**
   - Check if backend routes are properly configured
   - Verify vercel.json routing configuration
   - Check function logs in Vercel dashboard

### Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Configure proper CORS origins
   - Set up rate limiting
   - Use HTTPS only

2. **Performance**
   - Enable caching where appropriate
   - Optimize images and assets
   - Use CDN for static files

3. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor API performance
   - Set up uptime monitoring

### File Structure for Deployment

```
viraldeals.online/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── vercel.json        # Vercel configuration
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

### Support

If you encounter any issues during deployment:
1. Check Vercel build logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connection

The application includes comprehensive error handling and logging to help diagnose issues.
