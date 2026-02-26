'use client';

import { useState } from 'react';
import { PostProvider } from '../../context/PostContext';
import UserContext from '../../context/UserContext';
import Navbar from '../../components/Navbar/Navbar';
import LoginModal from '../../components/Auth/LoginModal';
import useAuth from '../../hooks/useAuth';

export default function ClientProviders({ children }) {
  const { user, setUser, loading, mutate } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PostProvider>
      <UserContext.Provider value={{ user, setUser, setModalOpen, loading, mutate }}>
        <header className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </header>
        <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        <main role="main">{children}</main>
      </UserContext.Provider>
    </PostProvider>
  );
}
