# Deployment Guide for StyleSense

This guide explains how to deploy the StyleSense application (Frontend + Backend + Database) for free.

## 1. Database: MongoDB Atlas (Free)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Sign up and create a **FREE** cluster (M0 Sandbox).
3.  Create a database user (username/password).
4.  Allow Access from Anywhere (`0.0.0.0/0`) in IP Access List (since Render IPs are dynamic).
5.  Get your **Connection String**: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.

## 2. Backend: Render (Free)

1.  Create a GitHub repository and push your code (you already did this).
2.  Sign up on [Render](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
6.  **Environment Variables** (Add these):
    *   `MONGODB_URL`: Your MongoDB Atlas connection string (from step 1).
    *   `DATABASE_NAME`: `outfit_analyzer`
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `SECRET_KEY`: A random secret string for JWT (e.g., generated with `openssl rand -hex 32`).
    *   `ALLOWED_ORIGINS`: `*` (or your frontend URL once deployed, comma separated).
7.  Click **Create Web Service**.
8.  **Note the URL**: It will be something like `https://stylesense-backend.onrender.com`.

## 3. Frontend: Vercel (Free)

1.  Sign up on [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend`
5.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your Render backend (e.g., `https://stylesense-backend.onrender.com`).
    *   **IMPORTANT**: Vercel requires environment variables to optimize the build.
6.  Click **Deploy**.
7.  **Note the URL**: It will be something like `https://stylesense.vercel.app`.

## 4. Final Configuration

1.  Go back to **Render** (Backend).
2.  Update `ALLOWED_ORIGINS` environment variable to include your Vercel URL (e.g., `https://stylesense.vercel.app`).
    *   Format: `http://localhost:3000,http://localhost:5173,https://stylesense.vercel.app`
3.  Redeploy Render (it might auto-deploy).

## Troubleshooting

*   **Render Cold Starts**: The free tier on Render spins down after inactivity. The first request might take 50+ seconds.
*   **CORS Errors**: Check `ALLOWED_ORIGINS` on Render. Ensure no trailing slashes in the URL.
*   **MongoDB Connection**: Ensure "Network Access" in MongoDB Atlas allows `0.0.0.0/0`.
