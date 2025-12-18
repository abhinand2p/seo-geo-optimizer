# Quick Start Deployment Guide

## TL;DR - Deploy in 15 Minutes

### Prerequisites
- GitHub account
- OpenAI API key ([Get it here](https://platform.openai.com/api-keys))

---

## Step-by-Step

### 1. Setup Upstash Redis (2 minutes)
```
1. Go to https://upstash.com → Sign up with GitHub
2. Create Database → Regional → Create
3. Copy the Endpoint (e.g., abc-123.upstash.io)
```

### 2. Push to GitHub (2 minutes)
```bash
cd /Users/mac/First/seo-geo-optimizer
git add .
git commit -m "Add deployment config"
git push origin main
```

### 3. Deploy Backend on Render (5 minutes)
```
1. Go to https://render.com → Sign up with GitHub
2. New + → Blueprint → Select your repo
3. Click "Apply"
4. Go to Environment tab, add:
   - OPENAI_API_KEY: your-key
   - REDIS_HOST: your-upstash-endpoint
   - REDIS_PORT: 6379
5. Save Changes
6. Wait for deploy (shows green checkmark)
7. Copy your URL: https://YOUR-APP.onrender.com
```

### 4. Deploy Frontend on Vercel (3 minutes)
```bash
cd frontend
npm i -g vercel
vercel login
vercel

# When prompted:
# - Setup? Yes
# - Project name? seo-geo-optimizer
# - Add environment variable?
#   Key: NEXT_PUBLIC_API_URL
#   Value: https://YOUR-APP.onrender.com

# Deploy to production
vercel --prod
```

### 5. Update Backend with Frontend URL (1 minute)
```
1. Back to Render → Your service → Environment
2. Add: FRONTEND_URL = https://your-app.vercel.app
3. Save (will redeploy)
```

### 6. Done! Test it
```
Frontend: https://your-app.vercel.app
Backend: https://YOUR-APP.onrender.com/health
```

---

## Important URLs

- **Upstash Dashboard**: https://console.upstash.com
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Get OpenAI Key**: https://platform.openai.com/api-keys

---

## First Time Setup Issues?

**Backend not starting?**
- Check all environment variables are set in Render
- Check deployment logs in Render dashboard

**Frontend can't connect?**
- Verify NEXT_PUBLIC_API_URL in Vercel environment variables
- Make sure backend URL doesn't have trailing slash

**Need help?**
- See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## What's Free?

- ✅ Vercel: Unlimited deployments
- ✅ Render: 750 hours/month (enough for demo)
- ✅ Upstash Redis: 10K commands/day
- ✅ PostgreSQL: Auto-included with Render

**Note**: Render free tier sleeps after 15 mins inactivity (takes ~30s to wake up)
