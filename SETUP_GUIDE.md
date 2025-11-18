# Sign Vision - Complete Setup Guide

This guide will walk you through setting up Sign Vision from scratch.

## Prerequisites

Before starting, make sure you have:
- ✅ Python 3.9 or higher
- ✅ Node.js 18 or higher
- ✅ A Google Cloud Platform account
- ✅ PostgreSQL (optional, SQLite can be used for development)

## Step 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "sign-vision")
4. Click "Create"

### 1.2 Enable Required APIs

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Cloud Vision API**
   - **Cloud Translation API**

### 1.3 Set Up Billing

1. Go to "Billing" in the Cloud Console
2. Link a billing account (required for API usage)
3. Both APIs have free tier quotas:
   - Vision API: 1,000 units/month free
   - Translation API: 500,000 characters/month free

### 1.4 Create Service Account Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name it (e.g., "sign-vision-service")
4. Click "Create and Continue"
5. Grant roles:
   - Cloud Vision API User
   - Cloud Translation API User
6. Click "Done"
7. Click on the service account you just created
8. Go to "Keys" tab
9. Click "Add Key" → "Create new key"
10. Choose JSON format
11. Click "Create" - the JSON file will download
12. **Important**: Save this file securely and never commit it to version control

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd "sign vision/backend"
```

### 2.2 Create Virtual Environment

```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your settings:
```bash
# IMPORTANT: Update these values
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your-service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# For development, SQLite is fine:
DATABASE_URL=sqlite:///./signvision.db

# Or use PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/signvision

# Frontend URL (default is fine for development):
CORS_ORIGINS=http://localhost:5173

# Optional settings (defaults are fine):
MAX_IMAGE_SIZE_MB=10
RATE_LIMIT_PER_MINUTE=30
```

### 2.5 Test Backend

```bash
python run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Visit http://localhost:8000/docs to see the API documentation.

## Step 3: Frontend Setup

### 3.1 Open New Terminal and Navigate to Frontend

```bash
cd "sign vision/frontend"
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment (Optional)

If your backend is running on a different URL:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

### 3.4 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. You should see the Sign Vision homepage
3. Try uploading an image with text or use your camera
4. The app should detect the text and allow you to translate it

## Common Issues and Solutions

### Issue: "Failed to access camera"
**Solution**: Make sure you're using HTTPS or localhost, and grant camera permissions in your browser.

### Issue: "Vision API error"
**Solution**: 
- Check that your service account JSON path is correct
- Verify that Cloud Vision API is enabled
- Ensure your Google Cloud project has billing enabled

### Issue: "Translation failed"
**Solution**:
- Verify Cloud Translation API is enabled
- Check your API quotas in Google Cloud Console

### Issue: "CORS error"
**Solution**: Make sure the backend's `CORS_ORIGINS` includes your frontend URL.

### Issue: "Module not found" errors
**Solution**: 
- Backend: Make sure virtual environment is activated and dependencies are installed
- Frontend: Delete `node_modules` and run `npm install` again

## Database Setup (Optional)

### Using SQLite (Default - No Setup Required)
The app will automatically create `signvision.db` file.

### Using PostgreSQL

1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE signvision;
```

3. Update `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/signvision
```

## Production Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Use a production WSGI server:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

3. Update the API URL in environment variables

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Never commit Google Cloud credentials JSON
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Use strong database passwords
- [ ] Regularly rotate API keys

## API Usage and Costs

### Free Tier Limits
- Vision API: 1,000 units/month
- Translation API: 500,000 characters/month

### Monitor Usage
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. View usage metrics for each API

## Support

For issues:
1. Check the browser console for errors
2. Check backend logs
3. Verify Google Cloud API status
4. Review the README.md for additional information

## Next Steps

- Explore the API documentation at http://localhost:8000/docs
- Check out the scan history feature
- Try different languages for translation
- Export your results as PDF or JSON
- Customize the UI theme with dark mode

Happy scanning! 📸🌍

