# 🎨 AI Outfit Analyzer

A production-ready, full-stack application that uses Google Gemini Vision API to analyze outfits and provide AI-powered fashion insights.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)
![Google Gemini](https://img.shields.io/badge/Gemini-Vision-orange)

## ✨ Features

- 📸 **Upload & Analyze** - Upload outfit images and get instant AI analysis
- ⭐ **Outfit Rating** - Get a 1-10 rating with detailed reasoning
- 💡 **Style Suggestions** - Receive personalized improvement tips
- 💰 **Budget Alternatives** - Find cheaper alternatives for clothing items
- 🎨 **Color Matching** - Get color combination recommendations
- 📊 **Dashboard** - View and manage all your outfit analyses
- 🔐 **Authentication** - Secure JWT-based authentication
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🌙 **Dark Mode** - Full dark mode support

## 🏗️ Architecture

```
ai-outfit-analyzer/
├── backend/                 # FastAPI Backend
│   ├── routes/             # API routes
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic & Gemini integration
│   ├── controllers/        # Request handlers
│   ├── auth/               # JWT authentication
│   ├── config/             # Configuration & database
│   └── utils/              # Helper functions
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API integration
│   │   └── contexts/      # React contexts
│   └── public/
│
└── docker-compose.yml      # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-outfit-analyzer
```

2. **Set up environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env
```

Required environment variables:
```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
```

3. **Start the application**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

## 🛠️ Development Setup

### Backend Only

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Add your Gemini API key to .env

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Only

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Outfit Analysis
- `POST /api/outfit/analyze` - Analyze outfit image
- `GET /api/outfit/{id}` - Get specific outfit analysis
- `GET /api/outfit/user/all` - Get all user's outfits
- `DELETE /api/outfit/{id}` - Delete outfit analysis

### Health Check
- `GET /api/health` - Check API health

## 🔑 API Authentication

All outfit endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📝 API Examples

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Analyze Outfit
```bash
curl -X POST http://localhost:8000/api/outfit/analyze \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@/path/to/outfit.jpg"
```

## 🎨 Frontend Pages

- **Home** (`/`) - Landing page with features
- **Login** (`/login`) - User login
- **Signup** (`/signup`) - User registration
- **Upload** (`/upload`) - Upload outfit for analysis
- **Result** (`/result/:id`) - View analysis results
- **Dashboard** (`/dashboard`) - View all analyses

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Build Backend Image
```bash
cd backend
docker build -t outfit-analyzer-backend .
```

### Build Frontend Image
```bash
cd frontend
docker build -t outfit-analyzer-frontend .
```

### Run Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🌍 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/` |
| `DATABASE_NAME` | Database name | `outfit_analyzer` |
| `SECRET_KEY` | JWT secret key | - |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `UPLOAD_DIR` | Upload directory path | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `5242880` (5MB) |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ File upload validation
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ MongoDB injection prevention
- ✅ Secure HTTP headers

## 📊 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String (unique),
  "full_name": String,
  "hashed_password": String,
  "created_at": DateTime
}
```

### Outfits Collection
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "image_filename": String,
  "analysis": {
    "detected_outfit_items": Array,
    "style_description": String,
    "outfit_rating": Object,
    "improvement_suggestions": Array,
    "cheaper_alternatives": Array,
    "color_matching_recommendations": Object
  },
  "created_at": DateTime
}
```

## 🎯 Key Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Google Gemini** - AI vision model
- **JWT** - Authentication
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Dropzone** - File upload
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 🐛 Troubleshooting

### Issue: MongoDB connection failed
**Solution:** Ensure MongoDB is running and the connection string is correct.

### Issue: Gemini API errors
**Solution:** Check your API key is valid and has sufficient quota.

### Issue: File upload fails
**Solution:** Ensure file is under 5MB and is JPG/PNG format.

### Issue: CORS errors
**Solution:** Check `FRONTEND_URL` in backend .env matches your frontend URL.

## 📈 Performance Optimization

- Image compression before upload
- Lazy loading for outfit cards
- Pagination for outfit list
- Caching for static assets
- Database indexing
- Connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for fashion enthusiasts and AI developers

## 🙏 Acknowledgments

- Google Gemini Vision API
- FastAPI Framework
- React Community
- TailwindCSS Team

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the API documentation at `/api/docs`
- Review the troubleshooting section

---

**Made with ❤️ using AI and modern web technologies**
