import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let initializationError = null;

export const getWebContainer = async () => {
    if (webContainerInstance === null) {
        try {
            console.log('🚀 Initializing WebContainer...');
            
            // Check if we're in a secure context
            if (!window.isSecureContext) {
                throw new Error('WebContainer requires a secure context (HTTPS or localhost)');
            }
            
            // Check for crossOriginIsolated
            if (!window.crossOriginIsolated) {
                console.warn('⚠️ WebContainer may not work properly without crossOriginIsolated headers');
                console.warn('For development, you may need to run with specific headers or use localhost');
                
                // Try to provide more specific guidance
                const currentUrl = window.location.href;
                const isVercel = currentUrl.includes('vercel.app');
                const isNetlify = currentUrl.includes('netlify.app');
                const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
                
                if (isLocalhost) {
                    console.warn('🔧 You are on localhost but still getting this error. Try:');
                    console.warn('1. Use http://localhost:5173 (not 127.0.0.1)');
                    console.warn('2. Run: npm run dev:webcontainer');
                    console.warn('3. Or use: npm run serve:webcontainer');
                } else if (isVercel) {
                    console.warn('🌐 Vercel deployment detected. WebContainer requires:');
                    console.warn('1. Check vercel.json has proper CORS headers');
                    console.warn('2. Redeploy with updated configuration');
                    console.warn('3. Verify headers in Network tab');
                } else if (isNetlify) {
                    console.warn('🌐 Netlify deployment detected. WebContainer requires:');
                    console.warn('1. Check _headers file has proper CORS headers');
                    console.warn('2. Redeploy with updated configuration');
                    console.warn('3. Verify headers in Network tab');
                } else {
                    console.warn('🌐 Production deployment detected. WebContainer requires:');
                    console.warn('1. Configure CORS headers for your hosting platform');
                    console.warn('2. Use localhost for development');
                }
            }
            
            webContainerInstance = await WebContainer.boot();
            console.log('✅ WebContainer initialized successfully');
            initializationError = null;
        } catch (error) {
            console.error('❌ WebContainer initialization failed:', error);
            initializationError = error;
            
            // Provide helpful error messages
            if (error.message.includes('SharedArrayBuffer')) {
                const currentUrl = window.location.href;
                let errorMessage = 'WebContainer requires SharedArrayBuffer support.\n\n';
                
                if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
                    errorMessage += 'You are on localhost but still getting this error.\n\n';
                    errorMessage += 'SOLUTIONS:\n';
                    errorMessage += '1. Use http://localhost:5173 (not 127.0.0.1)\n';
                    errorMessage += '2. Run: npm run dev:webcontainer\n';
                    errorMessage += '3. Or use: npm run serve:webcontainer\n';
                    errorMessage += '4. Clear browser cache and try again';
                } else {
                    errorMessage += 'You are not on localhost.\n\n';
                    errorMessage += 'SOLUTIONS:\n';
                    errorMessage += '1. Use localhost for development\n';
                    errorMessage += '2. Or configure CORS headers:\n';
                    errorMessage += '   Cross-Origin-Embedder-Policy: require-corp\n';
                    errorMessage += '   Cross-Origin-Opener-Policy: same-origin';
                }
                
                throw new Error(errorMessage);
            } else if (error.message.includes('secure context')) {
                throw new Error('WebContainer requires HTTPS or localhost. Please use a secure connection.');
            } else {
                throw new Error(`WebContainer initialization failed: ${error.message}`);
            }
        }
    }
    return webContainerInstance;
}

export const getWebContainerError = () => initializationError;
export const isWebContainerAvailable = () => webContainerInstance !== null;