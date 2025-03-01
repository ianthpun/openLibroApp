import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useEarnStore } from '../store/earnStore';
import ThemeToggle from '../components/ThemeToggle';
import { Shield, Coins, ArrowRight, X, DollarSign, BookOpen, Check, AlertTriangle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import AuthPopup from '../components/AuthPopup';
import { Link } from 'react-router-dom';

const AuditPage: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { 
    libroBalance, 
    stakedLibro, 
    openVoteBalance, 
    lockedOpenVote,
    libraryRequests,
    lockVoteTokens
  } = useEarnStore();
  const { user: privyUser } = usePrivy();
  
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [voteAmount, setVoteAmount] = useState<number>(0);
  
  // Show auth popup if user is not logged in
  useEffect(() => {
    if (!privyUser) {
      setShowAuthPopup(true);
    }
  }, [privyUser]);
  
  const handleVotePercentage = (percentage: number) => {
    setVoteAmount(Math.floor(openVoteBalance * percentage / 100));
  };
  
  const openVoteModal = (requestId: string) => {
    if (privyUser) {
      // Check if the request is already fully funded
      const request = libraryRequests.find(r => r.id === requestId);
      if (request && request.votesLocked >= request.requiredVotes) {
        return; // Don't open modal for fully funded requests
      }
      
      setSelectedRequestId(requestId);
      setIsVoteModalOpen(true);
    } else {
      setShowAuthPopup(true);
    }
  };
  
  const handleVote = () => {
    if (privyUser && selectedRequestId) {
      if (voteAmount > 0 && voteAmount <= openVoteBalance) {
        lockVoteTokens(selectedRequestId, voteAmount);
        setIsVoteModalOpen(false);
        setVoteAmount(0);
        setSelectedRequestId(null);
      }
    } else {
      setShowAuthPopup(true);
      setIsVoteModalOpen(false);
    }
  };
  
  const getSelectedRequest = () => {
    return libraryRequests.find(request => request.id === selectedRequestId);
  };
  
  // Format Ethereum address to show first 6 and last 4 characters
  const formatEthAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <>
      <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900' : ''} min-h-screen content-container`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Audit System
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
            <div className="flex items-center mb-4">
              <Shield className={`h-8 w-8 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Library Audit System
              </h2>
            </div>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              The Audit System allows you to review and verify all incoming library requests, ensuring the quality and accuracy of content added to the OpenBiblio platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                  Available $OPENVOTE
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {openVoteBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                  Locked $OPENVOTE
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {lockedOpenVote.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                How the Audit System Works
              </h3>
              <ul className={`list-disc pl-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
                <li>When you stake 50,000 $sLIBRO tokens, you receive 100,000 $OPENVOTE tokens</li>
                <li>You can lock $OPENVOTE tokens to vote for incoming library requests</li>
                <li>Once a book request reaches 250,000 locked $OPENVOTE tokens, it enters the pending approval state</li>
                <li>A third party will verify the book for quality and copyright compliance</li>
                <li>If approved, everyone receives their vote tokens back with a 5% bonus</li>
                <li>If rejected (copyright issues, etc.), locked tokens are slashed by 70% and sent to the LIBRODAO treasury</li>
                <li>To unstake your 50,000 $sLIBRO tokens, you must return 100,000 $OPENVOTE tokens</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                Pending Library Requests
              </h3>
              
              {libraryRequests.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-6 text-center`}>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    There are currently no pending submissions to review.
                  </p>
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Check back later for new content to audit.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {libraryRequests.map(request => (
                    <div 
                      key={request.id}
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-48 md:h-auto">
                          <img 
                            src={request.coverUrl} 
                            alt={request.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div>
                              <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {request.title}
                              </h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                by {request.author}
                              </p>
                            </div>
                            <div className={`mt-2 md:mt-0 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Submitted by: <code className="font-mono">{formatEthAddress(request.submittedBy)}</code>
                              <br />
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                            {request.description}
                          </p>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Votes: {request.votesLocked.toLocaleString()} / {request.requiredVotes.toLocaleString()}
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {((request.votesLocked / request.requiredVotes) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                              <div 
                                className={`h-2 rounded-full ${isDarkMode ? 'bg-purple-500' : 'bg-purple-500'}`}
                                style={{ width: `${Math.min((request.votesLocked / request.requiredVotes) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            {request.votesLocked >= request.requiredVotes ? (
                              <button
                                disabled
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                  isDarkMode 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Fully Funded
                              </button>
                            ) : (
                              <button
                                onClick={() => openVoteModal(request.id)}
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                  isDarkMode 
                                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                                }`}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Vote
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {isVoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Lock $OPENVOTE Tokens
              </h3>
              <button 
                onClick={() => setIsVoteModalOpen(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {getSelectedRequest()?.title}
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  by {getSelectedRequest()?.author}
                </p>
              </div>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Amount to Lock
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={voteAmount}
                    onChange={(e) => setVoteAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`block w-full rounded-l-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter amount"
                    min="0"
                    max={openVoteBalance}
                  />
                  <div className={`px-4 py-2 rounded-r-md ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    $OPENVOTE
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available: {openVoteBalance.toLocaleString()} $OPENVOTE
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleVotePercentage(10)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    10%
                  </button>
                  <button
                    onClick={() => handleVotePercentage(50)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleVotePercentage(100)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                <div className="flex justify-between mb-2">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>You Lock:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {voteAmount.toLocaleString()} $OPENVOTE
                  </span>
                </div>
                
                <div className="flex items-start mt-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <Check className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  </div>
                  <p className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    If approved, you'll receive back {voteAmount.toLocaleString()} + {Math.floor(voteAmount * 0.05).toLocaleString()} bonus $OPENVOTE tokens
                  </p>
                </div>
                
                <div className="flex items-start mt-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  </div>
                  <p className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    If rejected, you'll lose {Math.floor(voteAmount * 0.7).toLocaleString()} $OPENVOTE tokens (70% slashed)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsVoteModalOpen(false)}
                  className={`px-4 py-2 rounded-lg mr-3 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVote}
                  disabled={voteAmount <= 0 || voteAmount > openVoteBalance}
                  className={`px-4 py-2 rounded-lg ${
                    voteAmount <= 0 || voteAmount > openVoteBalance
                      ? isDarkMode 
                        ? 'bg-purple-800 text-purple-300 opacity-50 cursor-not-allowed' 
                        : 'bg-purple-300 text-purple-700 opacity-50 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  Lock $OPENVOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Popup */}
      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)}
        message="Sign in to access the Audit System and stake your $LIBRO tokens"
      />
    </>
  );
};

export default AuditPage;