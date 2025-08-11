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
          <Navbar />
          <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          <main className="pt-16">
            <Component {...pageProps} />
          </main>
        </div>
      </UserContext.Provider>
    </PostProvider>
  );
}

export default MyApp;
