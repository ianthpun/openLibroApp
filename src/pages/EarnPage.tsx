import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { useEarnStore, Task } from '../store/earnStore';
import ThemeToggle from '../components/ThemeToggle';
import { Award, BookOpen, Book, Flame, Library, Compass, Check, ChevronRight, Coins, Plus, Shield, X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import AuthPopup from '../components/AuthPopup';

const EarnPage: React.FC = () => {
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const { user: privyUser } = usePrivy();
  const { 
    tasks, 
    libroBalance, 
    stakedLibro,
    openVoteBalance,
    fetchTasks, 
    updateTaskProgress, 
    completeTask, 
    claimReward, 
    isLoading,
    simulateProgress 
  } = useEarnStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
    }
  }, [user, fetchTasks]);
  
  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'book-open':
        return <BookOpen className="h-6 w-6" />;
      case 'book':
        return <Book className="h-6 w-6" />;
      case 'flame':
        return <Flame className="h-6 w-6" />;
      case 'library':
        return <Library className="h-6 w-6" />;
      case 'compass':
        return <Compass className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };
  
  const handleClaimReward = (taskId: string) => {
    if (user) {
      claimReward(user.id, taskId);
    }
  };
  
  const handleTaskClick = (task: Task) => {
    if (privyUser) {
      setSelectedTask(task);
    } else {
      setShowAuthPopup(true);
    }
  };
  
  const closeTaskDetails = () => {
    setSelectedTask(null);
  };
  
  const handleSimulateProgress = () => {
    if (privyUser) {
      if (user) {
        simulateProgress(user.id);
      }
    } else {
      setShowAuthPopup(true);
    }
  };
  
  // Group tasks by type
  const dailyTasks = tasks.filter(task => task.type === 'daily');
  const monthlyTasks = tasks.filter(task => task.type === 'monthly');
  const achievementTasks = tasks.filter(task => task.type === 'achievement');
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full content-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading tasks...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900' : ''} min-h-screen content-container`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Earn $OPENVOTE
            </h1>
            
            {/* Balance display */}
            <div className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} bg-opacity-20 rounded-lg px-3 py-1 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">{openVoteBalance.toLocaleString()} $OPENVOTE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={handleSimulateProgress}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm sm:text-base flex-1 sm:flex-none ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Simulate
            </button>
            <ThemeToggle />
          </div>
        </div>
        
        <div className={`mb-6 p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center">
              <Award className={`h-8 w-8 mr-3 mt-1 sm:mt-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Complete tasks to earn $OPENVOTE tokens
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 text-sm sm:text-base`}>
                  $OPENVOTE tokens can be used to vote on library submissions and earn rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* Daily Tasks */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Daily Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {dailyTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-4 cursor-pointer transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} mr-3`}>
                        {getTaskIcon(task.icon)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{task.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Progress: {task.progress}/{task.target}
                      </span>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        +{task.reward} $OPENVOTE
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min((task.progress / task.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {task.isCompleted && (
                    <div className="mt-2 flex justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Monthly Tasks */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Monthly Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {monthlyTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-4 cursor-pointer transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} mr-3`}>
                        {getTaskIcon(task.icon)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{task.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Progress: {task.progress}/{task.target}
                      </span>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        +{task.reward} $OPENVOTE
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${Math.min((task.progress / task.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {task.isCompleted && (
                    <div className="mt-2 flex justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Achievements */}
          <div>
            <h2 className={`text-lg font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {achievementTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-4 cursor-pointer transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} mr-3`}>
                        {getTaskIcon(task.icon)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{task.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Progress: {task.progress}/{task.target}
                      </span>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        +{task.reward} $OPENVOTE
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${Math.min((task.progress / task.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {task.isCompleted && (
                    <div className="mt-2 flex justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Task Details Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
              <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {selectedTask.title}
                  </h3>
                  <button 
                    onClick={closeTaskDetails}
                    className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    selectedTask.type === 'daily' 
                      ? isDarkMode ? 'bg-blue-900' : 'bg-blue-100' 
                      : selectedTask.type === 'monthly'
                        ? isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                        : isDarkMode ? 'bg-green-900' : 'bg-green-100'
                  } mr-4`}>
                    {getTaskIcon(selectedTask.icon)}
                  </div>
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>{selectedTask.description}</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTask.type === 'daily' 
                        ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' 
                        : selectedTask.type === 'monthly'
                          ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                          : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedTask.type.charAt(0).toUpperCase() + selectedTask.type.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Progress: {selectedTask.progress}/{selectedTask.target}
                    </span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      Reward: {selectedTask.reward} $OPENVOTE
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-3 rounded-full ${
                        selectedTask.type === 'daily' 
                          ? 'bg-blue-500' 
                          : selectedTask.type === 'monthly'
                            ? 'bg-purple-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((selectedTask.progress / selectedTask.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={closeTaskDetails}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Close
                  </button>
                  
                  {selectedTask.isCompleted ? (
                    <button
                      onClick={() => {
                        handleClaimReward(selectedTask.id);
                        closeTaskDetails();
                      }}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        isDarkMode 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Claim Reward
                    </button>
                  ) : (
                    <div className={`px-4 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-400' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      Complete Task to Claim
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Popup */}
      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)}
        message="Sign in to access the Earn features and track your progress"
      />
    </>
  );
};

export default EarnPage;