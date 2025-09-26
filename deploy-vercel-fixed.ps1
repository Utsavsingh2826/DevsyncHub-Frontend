# Fixed Vercel Deployment Script for WebContainer
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

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path ".vercel") {
    Remove-Item -Recurse -Force ".vercel"
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

# Deploy to Vercel with WebContainer configuration
Write-Host "🚀 Deploying to Vercel with WebContainer configuration..." -ForegroundColor Blue
vercel --prod --config vercel.webcontainer.json

# Check deployment status
if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open your Vercel URL" -ForegroundColor White
    Write-Host "2. Open DevTools → Console" -ForegroundColor White
    Write-Host "3. Look for WebContainer diagnostics" -ForegroundColor White
    Write-Host "4. Check Network tab for CORS headers" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 To verify WebContainer is working:" -ForegroundColor Cyan
    Write-Host "1. Open DevTools → Console" -ForegroundColor White
    Write-Host "2. Look for 'WebContainer Diagnostics' output" -ForegroundColor White
    Write-Host "3. Check if crossOriginIsolated is true" -ForegroundColor White
    Write-Host "4. Try creating a project and running it" -ForegroundColor White
    Write-Host ""
    Write-Host "🛠️ If WebContainer still doesn't work:" -ForegroundColor Yellow
    Write-Host "1. Check the console for specific error messages" -ForegroundColor White
    Write-Host "2. Verify CORS headers in Network tab" -ForegroundColor White
    Write-Host "3. Try a different browser (Chrome recommended)" -ForegroundColor White
    Write-Host "4. Clear browser cache and reload" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
