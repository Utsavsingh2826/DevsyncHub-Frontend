# 🚀 Vercel Deployment Guide for WebContainer

## Problem
WebContainer requires specific CORS headers to work in production. Without these headers, you get:
```
WebContainer requires SharedArrayBuffer support. Please ensure your server has proper CORS headers
```

## Solution

### 1. Use the Correct Vercel Configuration

**Option A: Use `vercel.json` (Recommended)**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "cross-origin"
        },
        {
          "key": "Cross-Origin-Isolation",
          "value": "true"
        }
      ]
    }
  ],
  "buildCommand": "npm run build:simple",
  "outputDirectory": "dist"
}
```

**Option B: Use `vercel.webcontainer.json` (Advanced)**
This file is already created with comprehensive WebContainer support.

### 2. Build Configuration

Make sure your `package.json` has the correct build script:
```json
{
  "scripts": {
    "build:simple": "vite build --config vite.config.simple.js"
  }
}
```

### 3. Deploy to Vercel

#### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd soen/frontend
vercel --prod
```

#### Method 2: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically detect the `vercel.json` configuration

#### Method 3: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your project
3. Vercel will use the `vercel.json` configuration automatically

### 4. Verify Deployment

After deployment, check:

1. **Open your Vercel URL**
2. **Open Browser DevTools → Network tab**
3. **Reload the page**
4. **Check response headers for:**
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Isolation: true`

5. **In Console, check:**
   ```javascript
   console.log('crossOriginIsolated:', window.crossOriginIsolated);
   // Should be true
   ```

### 5. Troubleshooting

#### If WebContainer still doesn't work:

**Check 1: Headers are present**
- Open DevTools → Network → Reload page
- Look for the CORS headers in the main document response

**Check 2: Browser compatibility**
- Use Chrome, Edge, or Firefox
- Safari has limited WebContainer support

**Check 3: Clear browser cache**
- Hard refresh (Ctrl+Shift+R)
- Clear site data

**Check 4: Vercel configuration**
- Ensure `vercel.json` is in the frontend directory
- Check Vercel deployment logs for errors

### 6. Alternative Solutions

#### If Vercel headers don't work:

**Option A: Use Netlify**
- Deploy to Netlify instead
- Use the `_headers` file (already created)

**Option B: Custom Server**
- Use the `dev-server.js` with proper CORS headers
- Deploy to any hosting platform

**Option C: Disable WebContainer for production**
- Add a feature flag to disable WebContainer in production
- Show a message: "WebContainer not available in production"

### 7. Production Optimization

The current setup includes:
- ✅ Proper CORS headers for WebContainer
- ✅ Optimized build configuration
- ✅ Code splitting for better performance
- ✅ RemixIcon build fixes
- ✅ Multiple deployment options

### 8. Environment Variables

If you need environment variables in Vercel:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add your variables
3. Redeploy

### 9. Custom Domain

If using a custom domain:
1. Add domain in Vercel Dashboard
2. Update DNS settings
3. The CORS headers will still work

## 🎉 Success!

After following these steps, your WebContainer should work perfectly on Vercel!

### Quick Checklist:
- [ ] `vercel.json` file is present
- [ ] Build script is correct
- [ ] Deployed to Vercel
- [ ] Headers are present in Network tab
- [ ] `window.crossOriginIsolated` is true
- [ ] WebContainer initializes without errors
