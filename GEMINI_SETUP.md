# Gemini API Setup Guide

This guide will help you get your Gemini API key to use with Sign Vision.

## Why Gemini?

Sign Vision now uses Google's **Gemini API** instead of separate Cloud Vision and Translation APIs. Benefits:

- ✅ **Simpler Setup** - Just one API key needed
- ✅ **Free Tier** - Generous free quota for development
- ✅ **Powerful** - Advanced multimodal AI for text detection and translation
- ✅ **No Billing Required** - Free tier doesn't require credit card
- ✅ **Easy to Use** - Simple API integration

## Quick Setup (2 Minutes)

### Step 1: Get Gemini API Key

1. Go to **[Google AI Studio](https://makersuite.google.com/app/apikey)**
   - Or visit: https://aistudio.google.com/app/apikey

2. Click **"Get API Key"** or **"Create API Key"**

3. Select **"Create API key in new project"** (or use existing project)

4. Copy your API key (starts with `AIza...`)

⚠️ **Important**: Keep your API key secure and never commit it to version control!

### Step 2: Configure Your Application

1. Navigate to the backend directory:
   ```bash
   cd "sign vision/backend"
   ```

2. Create a `.env` file:
   ```bash
   cp env.example .env
   ```

3. Edit `.env` and add your API key:
   ```bash
   GEMINI_API_KEY=AIzaSy...your-actual-key-here
   DATABASE_URL=sqlite:///./signvision.db
   CORS_ORIGINS=http://localhost:5173
   ```

4. Save the file

### Step 3: Install Dependencies

```bash
# Make sure you're in the backend directory
cd backend

# Create virtual environment (if not already created)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Start the Backend

```bash
python run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 5: Test It

1. Visit http://localhost:8000/docs
2. Try the `/health` endpoint
3. If it returns `{"status": "healthy"}`, you're good to go!

## Free Tier Limits

Gemini API Free Tier (as of 2024):
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is perfect for development and moderate production use!

## Usage Pricing (if you exceed free tier)

If you need more:
- **Gemini 1.5 Flash**: $0.075 per 1M tokens (input), $0.30 per 1M tokens (output)
- **Gemini 1.5 Pro**: Higher pricing but more capable

For most users, the free tier is sufficient!

## Monitoring Usage

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click on your project
3. View usage statistics and quotas

## Security Best Practices

### ✅ DO:
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Rotate keys periodically
- Monitor usage regularly

### ❌ DON'T:
- Commit API keys to git
- Share keys publicly
- Hardcode keys in source code
- Use production keys in development
- Expose keys in client-side code

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not set"

**Solution:**
1. Make sure `.env` file exists in `backend/` directory
2. Check that `GEMINI_API_KEY` is set in `.env`
3. Restart the backend server after editing `.env`

### Error: "API key not valid"

**Solution:**
1. Verify your API key is correct (no extra spaces)
2. Check if the key is active in Google AI Studio
3. Try creating a new API key

### Error: "Resource exhausted"

**Solution:**
- You've exceeded free tier limits
- Wait for quota to reset (daily/monthly)
- Or upgrade to paid tier

### Error: "Failed to detect text with Gemini"

**Solution:**
1. Check your internet connection
2. Verify API key is valid
3. Ensure image is clear and contains text
4. Check backend logs for detailed error

## Comparing to Google Cloud

| Feature | Gemini API | Google Cloud APIs |
|---------|-----------|-------------------|
| Setup | ✅ Simple (1 API key) | ❌ Complex (Service account, JSON) |
| Free Tier | ✅ Generous | ✅ Limited |
| Billing Required | ❌ No | ✅ Yes |
| Text Detection | ✅ Built-in | Separate API |
| Translation | ✅ Built-in | Separate API |
| Speed | ⚡ Fast | ⚡ Fast |
| Accuracy | 🎯 High | 🎯 High |

## Features with Gemini

### Text Detection
- Detects text in 100+ languages
- Handles multiple scripts (Latin, Arabic, Chinese, etc.)
- Works with handwritten text
- Processes complex layouts

### Translation
- Translates between 100+ languages
- Maintains context and tone
- Handles idioms and expressions
- Preserves formatting

## Advanced Configuration

### Using Different Gemini Models

Edit `backend/app/services/vision_api.py` or `translate_api.py`:

```python
# For better accuracy (but slower/more expensive)
self.model = genai.GenerativeModel('gemini-1.5-pro')

# For faster responses (default)
self.model = genai.GenerativeModel('gemini-1.5-flash')
```

### Rate Limiting

To avoid hitting rate limits, you can add delays or implement queuing:

```python
import time

# Add delay between requests
time.sleep(0.1)
```

## Getting Help

### Official Resources
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Pricing](https://ai.google.dev/pricing)

### Common Links
- Get API Key: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/docs
- Quickstart: https://ai.google.dev/tutorials/python_quickstart

## Next Steps

Once your Gemini API is configured:

1. ✅ Start the frontend: `cd frontend && npm run dev`
2. ✅ Test the app at http://localhost:5173
3. ✅ Upload an image with text
4. ✅ Watch the magic happen!

**You're all set!** 🚀

The Gemini setup is much simpler than Google Cloud - enjoy building with Sign Vision!

