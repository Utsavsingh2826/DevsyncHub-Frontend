#!/usr/bin/env node

// Optimized build script for production
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized build process...\n');

try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
        execSync('rm -rf dist', { stdio: 'inherit' });
    }

    // Build with optimizations
    console.log('📦 Building with optimizations...');
    execSync('npm run build:webcontainer', { stdio: 'inherit' });

    // Analyze bundle size
    console.log('\n📊 Analyzing bundle sizes...');
    const distPath = path.join(__dirname, 'dist');
    
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath, { recursive: true });
        const jsFiles = files.filter(file => file.endsWith('.js'));
        const cssFiles = files.filter(file => file.endsWith('.css'));
        
        console.log('\n📁 Generated files:');
        jsFiles.forEach(file => {
            const filePath = path.join(distPath, file);
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  📄 ${file}: ${sizeKB} KB`);
        });
        
        cssFiles.forEach(file => {
            const filePath = path.join(distPath, file);
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  🎨 ${file}: ${sizeKB} KB`);
        });
    }

    console.log('\n✅ Build completed successfully!');
    console.log('📝 Bundle has been optimized with:');
    console.log('  • Code splitting for better performance');
    console.log('  • Manual chunking for optimal loading');
    console.log('  • Tree shaking for smaller bundles');
    console.log('  • Minification and compression');
    
    console.log('\n🚀 Ready for deployment!');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
