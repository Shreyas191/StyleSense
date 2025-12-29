# 🚀 Quick Setup Guide

This guide will help you get the AI Outfit Analyzer up and running in minutes.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Docker Desktop installed and running
- [ ] Docker Compose installed (comes with Docker Desktop)
- [ ] Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- [ ] At least 2GB free disk space
- [ ] Ports 3000, 8000, and 27017 available

## Step-by-Step Setup

### 1. Get Your Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with "AIza...")

### 2. Configure Environment

```bash
# Navigate to project directory
cd ai-outfit-analyzer

# The .env file is already created, just edit it
nano .env  # or use any text editor
```

Replace `your-gemini-api-key-here` with your actual API key:
```env
GEMINI_API_KEY=AIzaSyD...your-actual-key...
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### 3. Start Everything with Docker

```bash
# Build and start all services
docker-compose up --build
```

This single command will:
- ✅ Build the frontend (React)
- ✅ Build the backend (FastAPI)
- ✅ Start MongoDB
- ✅ Connect everything together

**First build takes 3-5 minutes. Subsequent starts take ~10 seconds.**

### 4. Verify It's Working

Open your browser and check:

1. **Frontend**: http://localhost:3000
   - You should see the landing page
   
2. **Backend API**: http://localhost:8000/api/docs
   - You should see the interactive API documentation
   
3. **Health Check**: http://localhost:8000/api/health
   - Should return `{"status": "healthy"}`

### 5. Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter your details:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: minimum 6 characters
4. Click "Create Account"

You'll be automatically logged in and redirected to the dashboard!

### 6. Analyze Your First Outfit

1. Click "Analyze Outfit" or navigate to the Upload page
2. Drag and drop an outfit image (or click to browse)
3. Click "Analyze with AI"
4. Wait 5-10 seconds for AI analysis
5. View your detailed outfit analysis!

## Common Issues & Solutions

### Issue: Port already in use

**Error:** "port is already allocated"

**Solution:**
```bash
# Stop the conflicting service, then:
docker-compose down
docker-compose up
```

### Issue: Gemini API Error

**Error:** "Failed to analyze outfit"

**Solution:**
1. Check your API key is correct in `.env`
2. Verify your API key has quota remaining
3. Restart the backend:
```bash
docker-compose restart backend
```

### Issue: Can't connect to MongoDB

**Error:** Connection refused to MongoDB

**Solution:**
```bash
# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build
```

### Issue: Frontend not loading

**Error:** White screen or connection refused

**Solution:**
```bash
# Check if frontend container is running
docker ps

# If not running, restart
docker-compose restart frontend
```

## Stopping the Application

```bash
# Stop all services (data persists)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Development Mode (Without Docker)

If you want to run services individually for development:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### MongoDB
```bash
# Install MongoDB locally or use Docker:
docker run -d -p 27017:27017 mongo:7.0
```

## Testing the API

### Using Postman

1. Import `postman_collection.json`
2. Set the `base_url` variable to `http://localhost:8000`
3. Run the "Signup" request to create a user
4. The token will be automatically saved
5. Try other endpoints!

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## What's Next?

- ✅ Upload different outfit styles
- ✅ Explore the dashboard
- ✅ Try the color matching recommendations
- ✅ Check out budget alternatives
- ✅ Share your analyses

## Need Help?

- 📖 Check `README.md` for comprehensive documentation
- 📡 Read `API_DOCUMENTATION.md` for API details
- 🐛 Report issues on GitHub
- 💬 Check the troubleshooting section in README.md

## Performance Tips

1. **Image Quality**: Use clear, well-lit photos for best results
2. **File Size**: Compress images to ~1-2MB for faster uploads
3. **Full Outfit**: Include the entire outfit in the frame
4. **Good Lighting**: Natural light works best

## Security Reminders

- 🔐 Change the `SECRET_KEY` in production
- 🚫 Never commit `.env` files to version control
- 🔒 Use strong passwords
- 🌐 Configure CORS properly for production

---

**Congratulations! You're all set up! 🎉**

Start analyzing outfits and get AI-powered fashion insights!
