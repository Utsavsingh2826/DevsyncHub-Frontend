#!/usr/bin/env node

// WebContainer Setup Script
// This script helps configure the environment for WebContainer to work properly

const fs = require('fs');
const path = require('path');

console.log('🔧 WebContainer Setup Script');
console.log('============================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: Please run this script from the frontend directory');
    process.exit(1);
}

console.log('✅ Found package.json');

// Create .env.local file with WebContainer configuration
const envContent = `# WebContainer Configuration
VITE_WEBCONTAINER_DEBUG=true
VITE_CROSS_ORIGIN_ISOLATED=true
`;

if (!fs.existsSync('.env.local')) {
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Created .env.local with WebContainer configuration');
} else {
    console.log('ℹ️  .env.local already exists');
}

// Update package.json scripts
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add WebContainer-specific scripts
packageJson.scripts = {
    ...packageJson.scripts,
    'dev:webcontainer': 'vite --host localhost --port 5173',
    'build:webcontainer': 'vite build',
    'preview:webcontainer': 'vite preview --host localhost --port 4173',
    'serve:webcontainer': 'node dev-server.js'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with WebContainer scripts');

// Create a comprehensive README for WebContainer setup
const readmeContent = `# WebContainer Setup Guide

## Quick Start (Recommended)

1. **Start the development server with proper CORS headers:**
   \`\`\`bash
   npm run dev:webcontainer
   \`\`\`

2. **Access your app at:** http://localhost:5173

## Alternative: Custom Server with CORS Headers

If the above doesn't work, use the custom server:

1. **Build the project:**
   \`\`\`bash
   npm run build:webcontainer
   \`\`\`

2. **Start the custom server:**
   \`\`\`bash
   npm run serve:webcontainer
   \`\`\`

3. **Access your app at:** http://localhost:3000

## Troubleshooting

### Error: "SharedArrayBuffer transfer requires self.crossOriginIsolated"

**Solution 1: Use localhost**
- Make sure you're accessing via \`http://localhost:5173\` (not 127.0.0.1 or IP address)

**Solution 2: Check browser console**
- Open DevTools → Console
- Look for CORS-related errors
- Ensure you see "Cross-Origin-Embedder-Policy: require-corp" in Network tab

**Solution 3: Browser flags (Development only)**
\`\`\`bash
# Chrome
chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev_test

# Firefox
firefox --disable-web-security
\`\`\`

### Error: "WebContainer requires a secure context"

**Solution:** Use HTTPS or localhost
- Localhost is considered secure by browsers
- For production, ensure HTTPS with proper CORS headers

## Production Deployment

For production, ensure your hosting platform supports these headers:

### Vercel
Create \`vercel.json\`:
\`\`\`json
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
        }
      ]
    }
  ]
}
\`\`\`

### Netlify
Create \`_headers\` file in \`public\` folder:
\`\`\`
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
\`\`\`

## Verification

1. Open DevTools → Network tab
2. Reload the page
3. Check response headers for:
   - \`Cross-Origin-Embedder-Policy: require-corp\`
   - \`Cross-Origin-Opener-Policy: same-origin\`
4. In Console, check if \`window.crossOriginIsolated\` is \`true\`

## Support

If you're still having issues:
1. Check the browser console for specific error messages
2. Ensure you're using a modern browser (Chrome 88+, Firefox 79+, Safari 15.2+)
3. Try incognito/private browsing mode
4. Clear browser cache and cookies
`;

fs.writeFileSync('WEBCONTAINER_SETUP.md', readmeContent);
console.log('✅ Created comprehensive WebContainer setup guide');

console.log('\n🎉 WebContainer setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev:webcontainer');
console.log('2. Open: http://localhost:5173');
console.log('3. Check browser console for any remaining errors');
console.log('\n📖 For detailed troubleshooting, see WEBCONTAINER_SETUP.md');
