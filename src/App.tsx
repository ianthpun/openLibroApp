import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { usePrivy } from '@privy-io/react-auth';

// Components
import Layout from './components/Layout';
import PrivyAuthProvider from './components/PrivyAuthProvider';
import ChatBubble from './components/ChatBubble';

// Pages
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import BookPage from './pages/BookPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import EarnPage from './pages/EarnPage';
import AuditPage from './pages/AuditPage';
import StakingPage from './pages/StakingPage';

function AppContent() {
  const { user, ready } = usePrivy();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<LibraryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="book/:id" element={<BookPage />} />
          <Route path="earn" element={<EarnPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="staking" element={<StakingPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <ChatBubble />
    </Router>
  );
}

function App() {
  return (
    <PrivyAuthProvider>
      <AppContent />
    </PrivyAuthProvider>
  );
}

export default App;