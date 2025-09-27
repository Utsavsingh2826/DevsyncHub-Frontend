# Single Comprehensive Vercel Deployment Script
Write-Host "🚀 Deploying DevSync Hub to Vercel with WebContainer..." -ForegroundColor Green

# Install Vercel CLI if not present
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel if needed
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Clean and build
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".vercel") { Remove-Item -Recurse -Force ".vercel" }

Write-Host "📦 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 To verify WebContainer works:" -ForegroundColor Cyan
    Write-Host "1. Open your Vercel URL" -ForegroundColor White
    Write-Host "2. Open DevTools → Console" -ForegroundColor White
    Write-Host "3. Look for 'WebContainer Diagnostics' output" -ForegroundColor White
    Write-Host "4. Check if crossOriginIsolated is true" -ForegroundColor White
    Write-Host "5. Try creating a project and running it" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}