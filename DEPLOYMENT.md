# Deployment Guide - SEO GEO Optimizer

This guide will help you deploy your application for FREE using:
- **Vercel** (Frontend)
- **Render** (Backend API + PostgreSQL)
- **Upstash** (Redis)

## Prerequisites

1. GitHub account (for connecting repositories)
2. OpenAI API key (required for the app to work)
3. Anthropic API key (optional but recommended)

---

## Part 1: Setup Upstash Redis (Free Redis Database)

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up with GitHub (free)
3. Click "Create Database"
   - Name: `seo-geo-optimizer-redis`
   - Type: Regional
   - Region: Choose closest to you
   - Click "Create"
4. Copy the connection details:
   - **Endpoint** (this is your REDIS_HOST without the port)
   - **Port** (usually 6379)
   - Note: You'll need these later

---

## Part 2: Deploy Backend to Render

### Step 1: Push Code to GitHub

```bash
cd /Users/mac/First/seo-geo-optimizer
git add .
git commit -m "Add deployment configuration"
git push origin main
```

If you haven't set up a GitHub repository yet:
```bash
# Create a new repository on GitHub first, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/seo-geo-optimizer.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (free)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Select the repository: `seo-geo-optimizer`
6. Render will detect the `render.yaml` file
7. Click "Apply"

### Step 3: Configure Environment Variables

After the blueprint is created, go to your web service:

1. Click on "seo-geo-optimizer-api"
2. Go to "Environment" tab
3. Add these environment variables:

```
OPENAI_API_KEY=your-actual-openai-api-key
ANTHROPIC_API_KEY=your-actual-anthropic-api-key
REDIS_HOST=your-upstash-redis-endpoint.upstash.io
REDIS_PORT=6379
FRONTEND_URL=https://your-app.vercel.app (add this later)
```

**Optional (for email features):**
```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

4. Click "Save Changes"
5. The service will automatically redeploy

### Step 4: Note Your Backend URL

- Your backend URL will be: `https://seo-geo-optimizer-api.onrender.com`
- Wait for deployment to complete (5-10 minutes first time)
- Test it: Open `https://seo-geo-optimizer-api.onrender.com/health`
- You should see: `{"status":"healthy","service":"api"}`

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Environment File

1. In your frontend folder, create `.env.local`:

```bash
cd /Users/mac/First/seo-geo-optimizer/frontend
```

Create a file with:
```
NEXT_PUBLIC_API_URL=https://seo-geo-optimizer-api.onrender.com
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/mac/First/seo-geo-optimizer/frontend
vercel login
vercel

# Follow the prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? seo-geo-optimizer (or your choice)
# - Directory? ./
# - Override settings? No
```

**Option B: Using Vercel Dashboard**

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://seo-geo-optimizer-api.onrender.com`
7. Click "Deploy"

### Step 3: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Open "seo-geo-optimizer-api" service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
5. Save changes (will trigger redeploy)

---

## Part 4: Verify Deployment

### Test Backend
```bash
curl https://seo-geo-optimizer-api.onrender.com/health
```

Expected response:
```json
{"status":"healthy","service":"api"}
```

### Test Frontend
1. Open your Vercel URL: `https://your-app-name.vercel.app`
2. The app should load
3. Try the features

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Backend will "sleep" after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for demos)
- PostgreSQL database: 90 days retention

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- No sleep time

**Upstash Redis:**
- 10,000 commands/day free
- Perfect for demos

### For Production Use

If you need production deployment later:
- Upgrade Render to paid plan ($7/month) for no sleep time
- Or deploy to AWS/GCP/Azure with Docker
- Consider using a dedicated Redis service

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Check logs in Render dashboard
- Ensure DATABASE_URL is properly configured

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

### Database connection issues
- Render provides PostgreSQL automatically
- Check the database is running in Render dashboard
- Environment variables should auto-populate from database

### Redis connection issues
- Verify Upstash credentials
- Check REDIS_HOST doesn't include `redis://` prefix
- Ensure port is 6379

---

## Getting API Keys

### OpenAI API Key (Required)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up / Login
3. Go to API Keys section
4. Create new secret key
5. Copy it (you won't see it again!)

### Anthropic API Key (Optional)
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up / Login
3. Go to API Keys
4. Create new key

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Upstash Redis created
- [ ] Backend deployed on Render
- [ ] Environment variables configured on Render
- [ ] Backend health check passes
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variable set
- [ ] Backend FRONTEND_URL updated
- [ ] App tested and working

---

## Quick Deploy Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy Frontend
cd frontend
vercel --prod

# That's it! Render will auto-deploy from GitHub.
```

---

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure API keys are valid

---

## Cost Summary

**Total Cost: $0/month for demo**

- Vercel: Free
- Render: Free (with sleep time)
- Upstash Redis: Free
- PostgreSQL: Free (included with Render)

Perfect for demos and presentations!
