import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
  type: 'daily' | 'monthly' | 'achievement';
  icon: string;
}

export interface LibraryRequest {
  id: string;
  title: string;
  author: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  coverUrl: string;
  votesLocked: number;
  status: 'pending' | 'approved' | 'rejected';
  requiredVotes: number;
}

interface EarnState {
  tasks: Task[];
  libroBalance: number;
  stakedLibro: number;
  openVoteBalance: number;
  lockedOpenVote: number;
  libraryRequests: LibraryRequest[];
  isLoading: boolean;
  
  fetchTasks: (userId: string) => Promise<void>;
  updateTaskProgress: (userId: string, taskId: string, progress: number) => Promise<void>;
  completeTask: (userId: string, taskId: string) => Promise<void>;
  claimReward: (userId: string, taskId: string) => Promise<void>;
  simulateProgress: (userId: string) => void; // For demo purposes
  stakeTokens: (amount: number) => void;
  unstakeTokens: (amount: number) => void;
  lockVoteTokens: (requestId: string, amount: number) => void;
  unlockVoteTokens: (requestId: string, amount: number) => void;
  getLockedVotesForRequest: (requestId: string) => number;
}

// Demo tasks with initial values
const initialTasks: Task[] = [
  {
    id: 'daily-reading',
    title: 'Daily Reading',
    description: 'Read 10 pages every day',
    reward: 5,
    isCompleted: false,
    progress: 3,
    target: 10,
    type: 'daily',
    icon: 'book-open'
  },
  {
    id: 'monthly-book',
    title: 'Monthly Book',
    description: 'Read a complete book this month',
    reward: 50,
    isCompleted: false,
    progress: 0,
    target: 1,
    type: 'monthly',
    icon: 'book'
  },
  {
    id: 'reading-streak',
    title: 'Reading Streak',
    description: 'Read for 5 consecutive days',
    reward: 25,
    isCompleted: false,
    progress: 2,
    target: 5,
    type: 'achievement',
    icon: 'flame'
  },
  {
    id: 'book-collection',
    title: 'Book Collection',
    description: 'Read 5 books in a month',
    reward: 100,
    isCompleted: false,
    progress: 1,
    target: 5,
    type: 'monthly',
    icon: 'library'
  },
  {
    id: 'genre-explorer',
    title: 'Genre Explorer',
    description: 'Read books from 3 different genres',
    reward: 30,
    isCompleted: false,
    progress: 2,
    target: 3,
    type: 'achievement',
    icon: 'compass'
  }
];

// Demo library requests
const initialLibraryRequests: LibraryRequest[] = [
  {
    id: 'req-001',
    title: 'The Quantum Paradox',
    author: 'Dr. Eleanor Wright',
    description: 'A groundbreaking exploration of quantum mechanics and its philosophical implications for our understanding of reality and consciousness.',
    submittedBy: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    submittedAt: '2025-06-15T14:32:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    votesLocked: 30524,
    status: 'pending',
    requiredVotes: 250000
  },
  {
    id: 'req-002',
    title: 'Echoes of Atlantis',
    author: 'Marina Delgado',
    description: 'A historical fiction novel that reimagines the lost civilization of Atlantis through the eyes of a modern archaeologist who discovers ancient technology beyond our current understanding.',
    submittedBy: '0x3A78BF5ad1B716e3C67F1D1A221b5c5eCa1D4E8d',
    submittedAt: '2025-06-12T09:15:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1551373884-8a0750074df7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    votesLocked: 250000,
    status: 'pending',
    requiredVotes: 250000
  },
  {
    id: 'req-003',
    title: 'The Algorithm of Empathy',
    author: 'Sanjay Mehta',
    description: 'An exploration of how artificial intelligence can be designed to understand and replicate human emotions, and the ethical implications of machines that can feel.',
    submittedBy: '0x7F9e8D6b4C1A2E3F5B6c7D8e9F0a1B2C3D4E5F6',
    submittedAt: '2025-06-10T16:45:00Z',
    coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    votesLocked: 232353,
    status: 'pending',
    requiredVotes: 250000
  }
];

export const useEarnStore = create<EarnState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      libroBalance: 100000, // Updated to 100,000 LIBRO tokens
      stakedLibro: 60000, // Increased to 60,000 to ensure audit access
      openVoteBalance: 120000, // Increased to match the staked amount (100k for 50k staked + 20k extra)
      lockedOpenVote: 0, // No locked OPENVOTE tokens initially
      libraryRequests: initialLibraryRequests,
      isLoading: false,
      
      fetchTasks: async (userId: string) => {
        set({ isLoading: true });
        try {
          // In a real implementation, we would fetch tasks from the database
          // For now, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In a real implementation, we would update the tasks based on the user's progress
          // For now, we'll just use the default tasks
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ isLoading: false });
        }
      },
      
      updateTaskProgress: async (userId: string, taskId: string, progress: number) => {
        try {
          const tasks = get().tasks;
          const updatedTasks = tasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  progress: Math.min(progress, task.target),
                  isCompleted: progress >= task.target 
                }
              : task
          );
          
          set({ tasks: updatedTasks });
          
          // In a real implementation, we would update the task progress in the database
        } catch (error) {
          console.error('Error updating task progress:', error);
        }
      },
      
      completeTask: async (userId: string, taskId: string) => {
        try {
          const tasks = get().tasks;
          const updatedTasks = tasks.map(task => 
            task.id === taskId 
              ? { ...task, isCompleted: true, progress: task.target }
              : task
          );
          
          set({ tasks: updatedTasks });
          
          // In a real implementation, we would mark the task as completed in the database
        } catch (error) {
          console.error('Error completing task:', error);
        }
      },
      
      claimReward: async (userId: string, taskId: string) => {
        try {
          const tasks = get().tasks;
          const task = tasks.find(t => t.id === taskId);
          
          if (!task || !task.isCompleted) return;
          
          // Update openVoteBalance instead of libroBalance
          set({ openVoteBalance: get().openVoteBalance + task.reward });
          
          // Mark task as claimed by resetting it
          const updatedTasks = tasks.map(t => 
            t.id === taskId 
              ? { ...t, isCompleted: false, progress: 0 }
              : t
          );
          
          set({ tasks: updatedTasks });
          
          // In a real implementation, we would update the user's balance in the database
          // and mark the reward as claimed
        } catch (error) {
          console.error('Error claiming reward:', error);
        }
      },
      
      // For demo purposes - simulate progress on random tasks
      simulateProgress: (userId: string) => {
        const tasks = get().tasks;
        const randomTaskIndex = Math.floor(Math.random() * tasks.length);
        const taskToUpdate = tasks[randomTaskIndex];
        
        if (taskToUpdate.progress < taskToUpdate.target) {
          const newProgress = taskToUpdate.progress + 1;
          const isCompleted = newProgress >= taskToUpdate.target;
          
          const updatedTasks = tasks.map((task, index) => 
            index === randomTaskIndex 
              ? { ...task, progress: newProgress, isCompleted }
              : task
          );
          
          set({ tasks: updatedTasks });
        }
      },
      
      // Stake LIBRO tokens to get sLIBRO
      stakeTokens: (amount: number) => {
        const { libroBalance, stakedLibro, openVoteBalance } = get();
        
        if (amount <= 0 || amount > libroBalance) return;
        
        // Check if this stake will cross the 50,000 threshold
        const wasBelow50k = stakedLibro < 50000;
        const willBeAbove50k = stakedLibro + amount >= 50000;
        
        // Update balances
        set({
          libroBalance: libroBalance - amount,
          stakedLibro: stakedLibro + amount
        });
        
        // If this stake crosses the 50,000 threshold, give 100,000 OPENVOTE tokens
        if (wasBelow50k && willBeAbove50k) {
          set({
            openVoteBalance: openVoteBalance + 100000
          });
        }
        
        // In a real implementation, we would update the user's balance in the database
      },
      
      // Unstake sLIBRO tokens to get LIBRO
      unstakeTokens: (amount: number) => {
        const { libroBalance, stakedLibro, openVoteBalance } = get();
        
        if (amount <= 0 || amount > stakedLibro) return;
        
        // Check if this unstake will go below the 50,000 threshold
        const wasAbove50k = stakedLibro >= 50000;
        const willBeBelow50k = stakedLibro - amount < 50000;
        
        // If going below 50k threshold, check if user has enough OPENVOTE tokens to return
        if (wasAbove50k && willBeBelow50k) {
          if (openVoteBalance < 100000) {
            console.error("Not enough OPENVOTE tokens to unstake below 50,000 sLIBRO threshold");
            return;
          }
          
          // Deduct the OPENVOTE tokens
          set({
            openVoteBalance: openVoteBalance - 100000
          });
        }
        
        // Update balances
        set({
          libroBalance: libroBalance + amount,
          stakedLibro: stakedLibro - amount
        });
        
        // In a real implementation, we would update the user's balance in the database
      },
      
      // Lock OPENVOTE tokens for a library request
      lockVoteTokens: (requestId: string, amount: number) => {
        const { openVoteBalance, lockedOpenVote, libraryRequests } = get();
        
        if (amount <= 0 || amount > openVoteBalance) return;
        
        // Update the library request with the locked votes
        const updatedRequests = libraryRequests.map(request => 
          request.id === requestId 
            ? { ...request, votesLocked: request.votesLocked + amount }
            : request
        );
        
        // Update balances
        set({
          openVoteBalance: openVoteBalance - amount,
          lockedOpenVote: lockedOpenVote + amount,
          libraryRequests: updatedRequests
        });
        
        // In a real implementation, we would update the database
      },
      
      // Unlock OPENVOTE tokens from a library request
      unlockVoteTokens: (requestId: string, amount: number) => {
        const { openVoteBalance, lockedOpenVote, libraryRequests } = get();
        const request = libraryRequests.find(r => r.id === requestId);
        
        if (!request) return;
        if (amount <= 0 || amount > request.votesLocked) return;
        
        // Update the library request with the unlocked votes
        const updatedRequests = libraryRequests.map(r => 
          r.id === requestId 
            ? { ...r, votesLocked: r.votesLocked - amount }
            : r
        );
        
        // Update balances
        set({
          openVoteBalance: openVoteBalance + amount,
          lockedOpenVote: lockedOpenVote - amount,
          libraryRequests: updatedRequests
        });
        
        // In a real implementation, we would update the database
      },
      
      // Get the number of votes locked for a specific request
      getLockedVotesForRequest: (requestId: string) => {
        const { libraryRequests } = get();
        const request = libraryRequests.find(r => r.id === requestId);
        return request ? request.votesLocked : 0;
      }
    }),
    {
      name: 'earn-storage',
    }
  )
);