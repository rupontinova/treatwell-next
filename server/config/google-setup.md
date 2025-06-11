# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services

## Step 2: Configure OAuth Consent Screen

1. Go to "OAuth consent screen" in the left sidebar
2. Choose "External" for user type
3. Fill in the required information:
   - App name: TreatWell
   - User support email: your-email@example.com
   - Developer contact email: your-email@example.com

## Step 3: Create OAuth 2.0 Credentials

1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - http://localhost:3001 (for development)
   - http://localhost:3000 (alternative port)
   - Your production domain
5. Add authorized redirect URIs:
   - http://localhost:3001/login
   - http://localhost:3000/login
   - Your production login URL

## Step 4: Environment Variables

Create a `.env` file in the `server` directory with:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/treatwell
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

## Step 5: Test the Integration

1. Start the backend server: `cd server && npm start`
2. Start the frontend: `npm run dev`
3. Navigate to `/login` and test Google Sign-In

## Important Notes

- The Google Client ID needs to be available in both frontend and backend
- Frontend uses `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Backend uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Make sure to whitelist your domains in Google Cloud Console 