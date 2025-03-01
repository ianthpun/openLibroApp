import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useEarnStore } from '../store/earnStore';
import ThemeToggle from '../components/ThemeToggle';
import { Shield, Coins, ArrowRight, X, DollarSign, Vote } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import AuthPopup from '../components/AuthPopup';
import { Link } from 'react-router-dom';

const StakingPage: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { 
    libroBalance, 
    stakedLibro, 
    openVoteBalance,
    stakeTokens, 
    unstakeTokens 
  } = useEarnStore();
  const { user: privyUser } = usePrivy();
  
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  // Show auth popup if user is not logged in
  useEffect(() => {
    if (!privyUser) {
      setShowAuthPopup(true);
    }
  }, [privyUser]);
  
  // Dollar value of LIBRO
  const libroPrice = 0.01;
  
  // Calculate dollar values
  const libroValue = libroBalance * libroPrice;
  const stakedValue = stakedLibro * libroPrice;
  
  // Required amount for audit access
  const requiredForAudit = 50000;
  const hasAuditAccess = stakedLibro >= requiredForAudit;
  
  const handleStakePercentage = (percentage: number) => {
    setStakeAmount(Math.floor(libroBalance * percentage / 100));
  };
  
  const handleUnstakePercentage = (percentage: number) => {
    setUnstakeAmount(Math.floor(stakedLibro * percentage / 100));
  };
  
  const handleStake = () => {
    if (privyUser) {
      if (stakeAmount > 0 && stakeAmount <= libroBalance) {
        stakeTokens(stakeAmount);
        setIsStakeModalOpen(false);
        setStakeAmount(0);
      }
    } else {
      setShowAuthPopup(true);
      setIsStakeModalOpen(false);
    }
  };
  
  const handleUnstake = () => {
    if (privyUser) {
      if (unstakeAmount > 0 && unstakeAmount <= stakedLibro) {
        unstakeTokens(unstakeAmount);
        setIsUnstakeModalOpen(false);
        setUnstakeAmount(0);
      }
    } else {
      setShowAuthPopup(true);
      setIsUnstakeModalOpen(false);
    }
  };
  
  const openStakeModal = () => {
    if (privyUser) {
      setIsStakeModalOpen(true);
    } else {
      setShowAuthPopup(true);
    }
  };
  
  const openUnstakeModal = () => {
    if (privyUser) {
      setIsUnstakeModalOpen(true);
    } else {
      setShowAuthPopup(true);
    }
  };
  
  return (
    <>
      <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900' : ''} min-h-screen content-container`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            $LIBRO Staking
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Left Column - Staking Info */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center mb-4">
              <Coins className={`h-8 w-8 mr-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Staking Overview
              </h2>
            </div>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Stake your $LIBRO tokens to receive $sLIBRO (staked LIBRO) and gain access to platform features like the Audit System.
            </p>
            
            <div className="flex mb-6">
              <div className={`relative rounded-l-lg overflow-hidden ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} flex-1`}>
                <button 
                  onClick={openStakeModal}
                  className={`w-full py-3 px-4 text-center font-medium ${
                    isDarkMode ? 'text-blue-100 hover:bg-blue-800' : 'text-blue-700 hover:bg-blue-200'
                  } transition-colors`}
                >
                  Stake
                </button>
                {isDarkMode && (
                  <div className="absolute inset-0 border-2 border-blue-700 rounded-l-lg pointer-events-none"></div>
                )}
              </div>
              <div className={`relative rounded-r-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-1`}>
                <button 
                  onClick={openUnstakeModal}
                  className={`w-full py-3 px-4 text-center font-medium ${
                    isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Unstake
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                  Available $LIBRO
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {libroBalance.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ≈ ${libroValue.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                  Staked $sLIBRO
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {stakedLibro.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ≈ ${stakedValue.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                  $OPENVOTE Tokens
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Vote className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {openVoteBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Audit Access Progress
                </h3>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {((stakedLibro / requiredForAudit) * 100).toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <div 
                  className={`h-2 rounded-full ${hasAuditAccess ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((stakedLibro / requiredForAudit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Current: {stakedLibro.toLocaleString()} $sLIBRO
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Required: {requiredForAudit.toLocaleString()} $sLIBRO
                </span>
              </div>
              
              {hasAuditAccess ? (
                <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'} text-sm flex items-center`}>
                  <Shield className="h-4 w-4 mr-2" />
                  <span>You have access to the Audit System</span>
                </div>
              ) : (
                <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'} text-sm flex items-center`}>
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Need {(requiredForAudit - stakedLibro).toLocaleString()} more $sLIBRO for Audit access</span>
                </div>
              )}
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                Staking Information
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex justify-between">
                  <span>Current $LIBRO Price:</span>
                  <span className="font-medium">${libroPrice.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Staking Ratio:</span>
                  <span className="font-medium">1 $LIBRO = 1 $sLIBRO</span>
                </li>
                <li className="flex justify-between">
                  <span>Audit Access Requirement:</span>
                  <span className="font-medium">50,000 $sLIBRO</span>
                </li>
                <li className="flex justify-between">
                  <span>$OPENVOTE Tokens Received:</span>
                  <span className="font-medium">100,000 when staking 50,000 $sLIBRO</span>
                </li>
                <li className="flex justify-between">
                  <span>Unstaking Requirement:</span>
                  <span className="font-medium">Return 100,000 $OPENVOTE to unstake 50,000 $sLIBRO</span>
                </li>
              </ul>
            </div>
            
            {hasAuditAccess && (
              <div className="mt-6">
                <Link 
                  to="/audit"
                  className={`inline-flex items-center px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Go to Audit System
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {isStakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Stake $LIBRO
              </h3>
              <button 
                onClick={() => setIsStakeModalOpen(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Amount to Stake
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`block w-full rounded-l-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter amount"
                    min="0"
                    max={libroBalance}
                  />
                  <div className={`px-4 py-2 rounded-r-md ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    $LIBRO
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available: {libroBalance.toLocaleString()} $LIBRO
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ≈ ${(stakeAmount * libroPrice).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStakePercentage(10)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    10%
                  </button>
                  <button
                    onClick={() => handleStakePercentage(50)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleStakePercentage(100)}
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
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>You Stake:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {stakeAmount.toLocaleString()} $LIBRO
                  </span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <ArrowRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>You Receive:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {stakeAmount.toLocaleString()} $sLIBRO
                  </span>
                </div>
                
                {/* Show OPENVOTE bonus if staking will cross the 50k threshold */}
                {stakedLibro < 50000 && stakedLibro + stakeAmount >= 50000 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        <Vote className="h-4 w-4 inline mr-1" />
                        Bonus:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        +100,000 $OPENVOTE
                      </span>
                    </div>
                    <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      You'll receive 100,000 $OPENVOTE tokens for reaching the 50,000 $sLIBRO threshold
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsStakeModalOpen(false)}
                  className={`px-4 py-2 rounded-lg mr-3 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  disabled={stakeAmount <= 0 || stakeAmount > libroBalance}
                  className={`px-4 py-2 rounded-lg ${
                    stakeAmount <= 0 || stakeAmount > libroBalance
                      ? isDarkMode 
                        ? 'bg-blue-800 text-blue-300 opacity-50 cursor-not-allowed' 
                        : 'bg-blue-300 text-blue-700 opacity-50 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Stake $LIBRO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unstake Modal */}
      {isUnstakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Unstake $sLIBRO
              </h3>
              <button 
                onClick={() => setIsUnstakeModalOpen(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Amount to Unstake
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`block w-full rounded-l-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter amount"
                    min="0"
                    max={stakedLibro}
                  />
                  <div className={`px-4 py-2 rounded-r-md ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    $sLIBRO
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Staked: {stakedLibro.toLocaleString()} $sLIBRO
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ≈ ${(unstakeAmount * libroPrice).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUnstakePercentage(10)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    10%
                  </button>
                  <button
                    onClick={() => handleUnstakePercentage(50)}
                    className={`py-1 rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleUnstakePercentage(100)}
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
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>You Unstake:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {unstakeAmount.toLocaleString()} $sLIBRO
                  </span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <ArrowRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>You Receive:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {unstakeAmount.toLocaleString()} $LIBRO
                  </span>
                </div>
                
                {/* Show OPENVOTE requirement if unstaking will go below the 50k threshold */}
                {stakedLibro >= 50000 && stakedLibro - unstakeAmount < 50000 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        <Vote className="h-4 w-4 inline mr-1" />
                        Required:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        -100,000 $OPENVOTE
                      </span>
                    </div>
                    <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      You must return 100,000 $OPENVOTE tokens to unstake below the 50,000 $sLIBRO threshold
                    </p>
                    
                    {openVoteBalance < 100000 && (
                      <div className={`mt-2 p-2 rounded ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} text-xs`}>
                        You don't have enough $OPENVOTE tokens. You need {(100000 - openVoteBalance).toLocaleString()} more.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {unstakeAmount > 0 && stakedLibro - unstakeAmount < requiredForAudit && stakedLibro >= requiredForAudit && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} mb-6`}>
                  <div className="flex items-start">
                    <Shield className={`h-5 w-5 mr-2 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        Warning: You will lose Audit access
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Unstaking this amount will reduce your $sLIBRO below the required 50,000 threshold for Audit access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsUnstakeModalOpen(false)}
                  className={`px-4 py-2 rounded-lg mr-3 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnstake}
                  disabled={
                    unstakeAmount <= 0 || 
                    unstakeAmount > stakedLibro || 
                    (stakedLibro >= 50000 && stakedLibro - unstakeAmount < 50000 && openVoteBalance < 100000)
                  }
                  className={`px-4 py-2 rounded-lg ${
                    unstakeAmount <= 0 || 
                    unstakeAmount > stakedLibro || 
                    (stakedLibro >= 50000 && stakedLibro - unstakeAmount < 50000 && openVoteBalance < 100000)
                      ? isDarkMode 
                        ? 'bg-blue-800 text-blue-300 opacity-50 cursor-not-allowed' 
                        : 'bg-blue-300 text-blue-700 opacity-50 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Unstake $sLIBRO
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
        message="Sign in to access the Staking System and manage your $LIBRO tokens"
      />
    </>
  );
};

export default StakingPage;