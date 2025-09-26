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
            }
            
            webContainerInstance = await WebContainer.boot();
            console.log('✅ WebContainer initialized successfully');
            initializationError = null;
        } catch (error) {
            console.error('❌ WebContainer initialization failed:', error);
            initializationError = error;
            
            // Provide helpful error messages
            if (error.message.includes('SharedArrayBuffer')) {
                throw new Error('WebContainer requires SharedArrayBuffer support. Please ensure your server has proper CORS headers (Cross-Origin-Embedder-Policy: require-corp, Cross-Origin-Opener-Policy: same-origin) or use localhost for development.');
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