# Backend GitHub Pages Deployment

## ✅ Configuration Complete

The backend API is now set up for automatic deployment to GitHub Pages when changes are pushed to the `main` branch.

## 📋 Setup Steps:

### Step 1: Enable GitHub Pages for Backend
Go to: https://github.com/sukrawebwizard-ux/parkingbackoffice/settings/pages

1. Under "Source", select:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/ (root)`
2. Click **Save**

### Step 2: Configure Environment Variables (GitHub Secrets)
Go to: https://github.com/sukrawebwizard-ux/parkingbackoffice/settings/secrets/actions

Add these secrets:
```
SUPABASE_URL=https://vkswtcmprjhjcsgunawm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrc3d0Y21wcmpoamNzZ3VuYXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMDI0MTIsImV4cCI6MjA3ODg3ODQxMn0.QRba5qmhaLp4I3elDN665Zu5x1e63spFC3S-4YGiAXI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrc3d0Y21wcmpoamNzZ3VuYXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMwMjQxMiwiZXhwIjoyMDc4ODc4NDEyfQ.N5_jazjuWJJzW0QAX7ap9ia7jqgWpaqolZNs2vN-zzg
JWT_SECRET=malta_parking_jwt_secret_key_2024_change_in_production
JWT_EXPIRY=24h
```

### Step 3: Push to GitHub
Once everything is configured, run:
```bash
git add backend/.github/workflows/deploy.yml
git commit -m "feat: Add backend GitHub Pages deployment"
git push origin main
```

## 🚀 Automatic Deployment Workflow

Every push to `main` branch in the `backend/` folder will:
1. ✅ Check out the code
2. ✅ Install Node.js dependencies
3. ✅ Copy backend files to dist folder
4. ✅ Deploy to GitHub Pages
5. ✅ Make API documentation available

## 📍 Backend API URL
After first deployment:
```
https://sukrawebwizard-ux.github.io/parkingbackoffice/
```

## 🔍 Monitor Deployments
View deployment status: https://github.com/sukrawebwizard-ux/parkingbackoffice/deployments

## ⚠️ Important Notes
- The workflow only triggers when files in `backend/` folder change
- GitHub Pages hosts static content; for a production API, consider:
  - **Railway.app**
  - **Render.com**
  - **Heroku**
  - **DigitalOcean App Platform**
  - **AWS Lambda / API Gateway**

For production API deployment, we recommend using Railway or Render instead of GitHub Pages.
