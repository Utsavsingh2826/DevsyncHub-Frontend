// WebContainer Diagnostics Utility
export const diagnoseWebContainer = () => {
  const diagnostics = {
    url: window.location.href,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isSecureContext: window.isSecureContext,
    crossOriginIsolated: window.crossOriginIsolated,
    userAgent: navigator.userAgent,
    isVercel: window.location.hostname.includes('vercel.app'),
    isNetlify: window.location.hostname.includes('netlify.app'),
    isLocalhost: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'),
    timestamp: new Date().toISOString()
  };

  console.log('🔍 WebContainer Diagnostics:', diagnostics);

  // Check for required features
  const issues = [];
  
  if (!diagnostics.isSecureContext) {
    issues.push('❌ Not in secure context (HTTPS or localhost required)');
  }
  
  if (!diagnostics.crossOriginIsolated) {
    issues.push('❌ crossOriginIsolated is false (CORS headers missing)');
  }
  
  if (diagnostics.protocol !== 'https:' && !diagnostics.isLocalhost) {
    issues.push('❌ Not using HTTPS (required for production)');
  }

  // Browser compatibility
  const isChrome = diagnostics.userAgent.includes('Chrome');
  const isEdge = diagnostics.userAgent.includes('Edg');
  const isFirefox = diagnostics.userAgent.includes('Firefox');
  const isSafari = diagnostics.userAgent.includes('Safari') && !diagnostics.userAgent.includes('Chrome');
  
  if (isSafari) {
    issues.push('⚠️ Safari has limited WebContainer support (use Chrome/Edge/Firefox)');
  }
  
  if (!isChrome && !isEdge && !isFirefox) {
    issues.push('⚠️ Unsupported browser (use Chrome/Edge/Firefox)');
  }

  // Platform-specific guidance
  if (diagnostics.isVercel) {
    issues.push('🌐 Vercel deployment detected - check vercel.json configuration');
  } else if (diagnostics.isNetlify) {
    issues.push('🌐 Netlify deployment detected - check _headers file');
  } else if (!diagnostics.isLocalhost) {
    issues.push('🌐 Production deployment - CORS headers may be missing');
  }

  if (issues.length === 0) {
    console.log('✅ All WebContainer requirements met!');
  } else {
    console.log('❌ WebContainer issues found:');
    issues.forEach(issue => console.log(issue));
  }

  return {
    diagnostics,
    issues,
    canUseWebContainer: issues.length === 0
  };
};

// Auto-diagnose on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      diagnoseWebContainer();
    }, 1000);
  });
}

