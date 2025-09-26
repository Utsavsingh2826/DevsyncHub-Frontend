# Vercel Deployment Script for WebContainer (PowerShell)
Write-Host "🚀 Deploying DevSync Hub to Vercel with WebContainer support..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if user is logged in
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Blue
npm run build:simple

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

# Check deployment status
if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open your Vercel URL" -ForegroundColor White
    Write-Host "2. Check browser DevTools → Network tab" -ForegroundColor White
    Write-Host "3. Look for CORS headers in the response" -ForegroundColor White
    Write-Host "4. Verify WebContainer works" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 To verify CORS headers are working:" -ForegroundColor Cyan
    Write-Host "1. Open DevTools → Console" -ForegroundColor White
    Write-Host "2. Run: console.log('crossOriginIsolated:', window.crossOriginIsolated)" -ForegroundColor White
    Write-Host "3. Should return: true" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
