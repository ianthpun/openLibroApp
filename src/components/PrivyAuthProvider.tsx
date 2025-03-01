import React, { useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '../store/userStore';

// Privy Auth Wrapper component
const PrivyAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, ready } = usePrivy();
  const { handlePrivyAuth, isLoading } = useUserStore();
  
  useEffect(() => {
    if (ready) {
      handlePrivyAuth(user);
    }
  }, [user, ready, handlePrivyAuth]);
  
  if (!ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Main Privy Provider component
const PrivyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the Privy app ID from environment variables
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  
  // Check if we have a valid Privy app ID
  const isValidAppId = privyAppId && privyAppId !== 'your-privy-app-id' && privyAppId.length > 10;
  
  // If we don't have a valid app ID, render a fallback UI
  if (!isValidAppId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Setup Required</h2>
            <p className="text-gray-600 mb-6">
              Please set up a valid Privy App ID in your environment variables to enable authentication.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Add your Privy App ID to the <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_PRIVY_APP_ID</code> variable in your <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file.
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&ixlib=rb-4.0.3',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <PrivyAuthWrapper>{children}</PrivyAuthWrapper>
    </PrivyProvider>
  );
};

export default PrivyAuthProvider;