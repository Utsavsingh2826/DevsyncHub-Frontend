import React from 'react'

const WebContainerFallback = ({ error, onRetry }) => {
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('127.0.0.1')
  
  const isVercel = window.location.hostname.includes('vercel.app')
  const isNetlify = window.location.hostname.includes('netlify.app')

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 m-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className="ri-error-warning-line text-2xl text-yellow-600"></i>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-yellow-800">
            WebContainer Not Available
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              WebContainer requires specific browser security features that aren't available in this environment.
            </p>
            
            {isProduction && (
              <div className="mt-4">
                <h4 className="font-medium text-yellow-800">Production Deployment Detected</h4>
                <p className="mt-1">
                  Your app is running on a production server. WebContainer may not work due to CORS restrictions.
                </p>
                
                {isVercel && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded">
                    <p className="text-sm">
                      <strong>Vercel Deployment:</strong> Make sure your <code>vercel.json</code> file includes the required CORS headers.
                    </p>
                  </div>
                )}
                
                {isNetlify && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded">
                    <p className="text-sm">
                      <strong>Netlify Deployment:</strong> Make sure your <code>_headers</code> file includes the required CORS headers.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="font-medium text-yellow-800">Solutions:</h4>
              <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                <li>Use localhost for development: <code>npm run dev:webcontainer</code></li>
                <li>Configure CORS headers for your hosting platform</li>
                <li>Try a different browser (Chrome, Edge, Firefox)</li>
                <li>Clear browser cache and reload</li>
              </ul>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <i className="ri-refresh-line mr-2"></i>
                Try Again
              </button>
              
              {!isProduction && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebContainerFallback
