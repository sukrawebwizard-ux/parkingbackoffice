# GitHub Pages Deployment Setup

## ✅ What's been configured:

1. **GitHub Actions Workflow** - Automatic build and deployment on push to `main`
2. **Build Process** - Runs `npm run build` to create production bundle
3. **Deploy to Pages** - Automatically deploys the `dist` folder to GitHub Pages

## 📝 Steps to Complete Setup:

### Step 1: Add GitHub Secrets
Go to: https://github.com/sukrawebwizard-ux/parkingbackoffice/settings/secrets/actions

Add these secrets:
```
VITE_SUPABASE_URL = https://vkswtcmprjhjcsgunawm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrc3d0Y21wcmpoamNzZ3VuYXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMDI0MTIsImV4cCI6MjA3ODg3ODQxMn0.QRba5qmhaLp4I3elDN665Zu5x1e63spFC3S-4YGiAXI
```

### Step 2: Enable GitHub Pages
Go to: https://github.com/sukrawebwizard-ux/parkingbackoffice/settings/pages

Settings:
- **Source**: Deploy from a branch
- **Branch**: `main`
- **Folder**: `/ (root)`

Click **Save**

### Step 3: Push to GitHub
Once configured, every push to `main` will:
1. Run `npm install`
2. Build the project (`npm run build`)
3. Deploy the `dist` folder to GitHub Pages

## 🔗 Your Site URL
After deployment completes, your site will be available at:
```
https://sukrawebwizard-ux.github.io/parkingbackoffice/
```

## ✨ Features
- ✅ Automatic build on every push
- ✅ Automatic deployment to GitHub Pages
- ✅ Environment variables from GitHub Secrets
- ✅ Works with pull requests (builds but doesn't deploy)

## 🚀 Custom Domain (Optional)
To use a custom domain like `maltaparking.com`:
1. Add a CNAME file to the `public` folder with your domain
2. Update DNS records to point to GitHub Pages
