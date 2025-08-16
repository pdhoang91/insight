// pages/_app.js
import { useState } from 'react';
import { PostProvider } from '../context/PostContext';

import UserContext from '../context/UserContext';
import Navbar from '../components/Navbar/Navbar';
import LoginModal from '../components/Auth/LoginModal';
import useAuth from '../hooks/useAuth';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const { user, setUser, loading, mutate } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PostProvider>
      <UserContext.Provider value={{ user, setUser, setModalOpen, loading, mutate }}>
        <div className="min-h-screen bg-terminal-black">
          {/* Site Header with Navigation */}
          <header className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </header>
          
          {/* Modal Dialogs */}
          <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          
          {/* Main Application Content */}
          <main className="pt-16" role="main">
            <Component {...pageProps} />
          </main>
        </div>
      </UserContext.Provider>
    </PostProvider>
  );
}

export default MyApp;
