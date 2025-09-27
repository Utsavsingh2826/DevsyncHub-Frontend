#!/usr/bin/env node

// WebContainer Fix Script
// This script helps diagnose and fix WebContainer SharedArrayBuffer issues

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 WebContainer Fix Script');
console.log('==========================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: Please run this script from the frontend directory');
    process.exit(1);
}

console.log('✅ Found package.json');

// Check current configuration
console.log('\n📋 Current Configuration:');
console.log('========================');

// Check if vite.config.js exists
if (fs.existsSync('vite.config.js')) {
    console.log('✅ vite.config.js exists');
} else {
    console.log('❌ vite.config.js missing');
}

// Check if dev-server.js exists
if (fs.existsSync('dev-server.js')) {
    console.log('✅ dev-server.js exists');
} else {
    console.log('❌ dev-server.js missing');
}

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('\n📦 Available Scripts:');
Object.keys(packageJson.scripts).forEach(script => {
    if (script.includes('webcontainer') || script.includes('dev') || script.includes('serve')) {
        console.log(`  ✅ npm run ${script}`);
    }
});

console.log('\n🔍 Diagnosing WebContainer Issues:');
console.log('==================================');

// Check for common issues
const issues = [];

// Check if running on localhost
console.log('\n1. URL Check:');
console.log('   Make sure you are accessing via:');
console.log('   ✅ http://localhost:5173 (recommended)');
console.log('   ✅ http://localhost:3000 (if using dev-server)');
console.log('   ❌ http://127.0.0.1:5173 (may not work)');
console.log('   ❌ https://your-domain.com (needs CORS headers)');

// Check browser support
console.log('\n2. Browser Support:');
console.log('   ✅ Chrome 88+ (recommended)');
console.log('   ✅ Edge 88+');
console.log('   ✅ Firefox 79+');
console.log('   ⚠️  Safari 15.2+ (partial support)');

// Check for CORS headers
console.log('\n3. CORS Headers Check:');
console.log('   Required headers:');
console.log('   ✅ Cross-Origin-Embedder-Policy: require-corp');
console.log('   ✅ Cross-Origin-Opener-Policy: same-origin');

console.log('\n🚀 Solutions:');
console.log('=============');

console.log('\nOption 1: Use Vite Dev Server (Recommended)');
console.log('--------------------------------------------');
console.log('1. Run: npm run dev:webcontainer');
console.log('2. Open: http://localhost:5173');
console.log('3. Check browser console for errors');

console.log('\nOption 2: Use Custom Server with CORS');
console.log('--------------------------------------');
console.log('1. Run: npm run build:simple');
console.log('2. Run: npm run serve:webcontainer');
console.log('3. Open: http://localhost:3000');

console.log('\nOption 3: Browser Flags (Development Only)');
console.log('-------------------------------------------');
console.log('Chrome:');
console.log('chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev_test');
console.log('');
console.log('Firefox:');
console.log('firefox --disable-web-security');

console.log('\nOption 4: Clear Browser Cache');
console.log('-----------------------------');
console.log('1. Open DevTools (F12)');
console.log('2. Right-click refresh button');
console.log('3. Select "Empty Cache and Hard Reload"');
console.log('4. Or use Ctrl+Shift+R');

console.log('\n🔧 Quick Fix Commands:');
console.log('======================');

console.log('\n# Method 1: Vite Dev Server');
console.log('npm run dev:webcontainer');
console.log('');

console.log('\n# Method 2: Custom Server');
console.log('npm run build:simple');
console.log('npm run serve:webcontainer');
console.log('');

console.log('\n# Method 3: Clear and Reinstall');
console.log('rm -rf node_modules package-lock.json');
console.log('npm install');
console.log('npm run dev:webcontainer');

console.log('\n📊 Verification Steps:');
console.log('======================');
console.log('1. Open browser console (F12)');
console.log('2. Check for WebContainer errors');
console.log('3. Verify window.crossOriginIsolated is true');
console.log('4. Look for "✅ WebContainer initialized successfully"');

console.log('\n🎯 Expected Console Output:');
console.log('===========================');
console.log('✅ 🚀 Initializing WebContainer...');
console.log('✅ ✅ WebContainer initialized successfully');
console.log('✅ No SharedArrayBuffer errors');

console.log('\n❌ If you still get errors:');
console.log('===========================');
console.log('1. Try different browser (Chrome recommended)');
console.log('2. Use incognito/private mode');
console.log('3. Check if antivirus is blocking SharedArrayBuffer');
console.log('4. Try different port (5174, 3001, etc.)');

console.log('\n📞 Still having issues?');
console.log('=======================');
console.log('1. Check the browser console for specific error messages');
console.log('2. Try the automated setup: npm run setup:webcontainer');
console.log('3. Use the simplified build: npm run build:simple');

console.log('\n🎉 WebContainer should now work!');
console.log('================================');
console.log('If you followed the steps above, WebContainer should initialize');
console.log('without SharedArrayBuffer errors. The key is using localhost');
console.log('with the proper development server configuration.');

