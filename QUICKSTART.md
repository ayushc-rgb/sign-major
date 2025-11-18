# Sign Vision - Quick Start Guide

Get Sign Vision up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.9+)
python3 --version

# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

## Quick Setup (3 Steps)

### 1. Get Gemini API Key (1 minute - FREE!)

1. Go to **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Click **"Get API Key"** or **"Create API Key"**
3. Click **"Create API key in new project"**
4. **Copy your API key** (starts with `AIza...`)

✅ **That's it!** No billing required, no complex setup!

### 2. Setup Backend (2 minutes)

```bash
cd "sign vision/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
GEMINI_API_KEY=your-api-key-here
DATABASE_URL=sqlite:///./signvision.db
CORS_ORIGINS=http://localhost:5173
EOL

# Edit .env and paste your actual Gemini API key!

# Start backend
python run.py
```

✅ Backend running at http://localhost:8000

### 3. Setup Frontend (2 minutes)

Open a new terminal:

```bash
cd "sign vision/frontend"

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:5173

## Test It Out (1 minute)

1. Open http://localhost:5173
2. Click "Browse Files" or "Start Camera"
3. Upload/capture an image with text
4. See the detected text!
5. Select a target language and click "Translate"

## Verify Everything Works

- [ ] Backend API docs accessible at http://localhost:8000/docs
- [ ] Frontend loads without errors
- [ ] Can upload an image
- [ ] Text is detected from image
- [ ] Can translate to another language
- [ ] Can view scan history

## Common Quick Fixes

### Backend won't start?
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Check if port 8000 is in use
lsof -i :8000  # On Mac/Linux
netstat -ano | findstr :8000  # On Windows
```

### Frontend won't start?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Failed to detect text" error?
- Make sure your Gemini API key is correct in `.env`
- Verify you have internet connection
- Check backend logs for detailed errors
- See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for troubleshooting

### Camera not working?
- Use HTTPS or localhost (HTTP is fine for localhost)
- Grant camera permissions in browser
- Try uploading a file instead

## Test Images

Don't have a sign image? Try these:
- Take a photo of any text on your phone
- Screenshot of this README
- Any image with clear, readable text
- Street signs, product labels, book covers

## Next Steps

✅ **You're all set!** 

Now check out:
- [GEMINI_SETUP.md](./GEMINI_SETUP.md) - Gemini API details
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [README.md](./README.md) - Full documentation

## Need Help?

1. Check [GEMINI_SETUP.md](./GEMINI_SETUP.md) for Gemini troubleshooting
2. Check backend logs in the terminal
3. Check browser console (F12)
4. Visit http://localhost:8000/docs for API testing

## Pro Tips

💡 **Gemini API is FREE** for development (no credit card needed)  
💡 Use SQLite for development (no database setup needed)  
💡 The app saves your scan history automatically  
💡 Try dark mode with the moon icon 🌙  
💡 Export your results as PDF or JSON  
💡 Use text-to-speech to hear translations  

## Why Gemini is Better

Compared to the old Google Cloud setup:
- ✅ **1 minute setup** vs 15 minutes
- ✅ **No billing required** vs credit card needed
- ✅ **One API key** vs complex service account
- ✅ **Generous free tier** vs limited free quota

Happy scanning! 📸

