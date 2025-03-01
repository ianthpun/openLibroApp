import React, { useState } from 'react';
import * as fcl from "@onflow/fcl";
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';

const FlowAuthButton: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { user, setUser } = useUserStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Set up FCL user subscription
  React.useEffect(() => {
    fcl.currentUser.subscribe(flowUser => {
      if (flowUser.addr) {
        // Update user store with Flow user info
        setUser({
          ...user,
          flowAddress: flowUser.addr,
          flowUser: flowUser
        });
      }
    });
  }, [setUser, user]);

  const handleAuth = async () => {
    setIsAuthenticating(true);
    try {
      if (user?.flowAddress) {
        await fcl.unauthenticate();
        setUser({
          ...user,
          flowAddress: null,
          flowUser: null
        });
      } else {
        await fcl.authenticate();
      }
    } catch (error) {
      console.error("Flow authentication error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isAuthenticating}
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
        isDarkMode
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isAuthenticating ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isAuthenticating ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : user?.flowAddress ? (
        <span>Disconnect Flow</span>
      ) : (
        <span>Connect Flow Wallet</span>
      )}
    </button>
  );
};

export default FlowAuthButton;