'use client';

import { useState, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { PostProvider } from '../../context/PostContext';
import UserContext from '../../context/UserContext';
import Navbar from '../../components/Navbar/Navbar';
import LoginModal from '../../components/Auth/LoginModal';
import GrainOverlay from '../../components/UI/GrainOverlay';
import FrogScrollbar from '../../components/UI/FrogScrollbar';
import useAuth from '../../hooks/useAuth';
import { useDesktopChromiumScrollUI } from '../../hooks/useDesktopChromiumScrollUI';

const SWR_GLOBAL_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 10000,
  errorRetryCount: 2,
  errorRetryInterval: 1000,
};

export default function ClientProviders({ children }) {
  const { user, setUser, loading, mutate } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { enabled: frogScrollEnabled } = useDesktopChromiumScrollUI();

  useEffect(() => {
    const html = document.documentElement;
    if (frogScrollEnabled) {
      html.setAttribute('data-frog-scroll', 'on');
    } else {
      html.removeAttribute('data-frog-scroll');
    }
    return () => {
      html.removeAttribute('data-frog-scroll');
    };
  }, [frogScrollEnabled]);

  return (
    <SWRConfig value={SWR_GLOBAL_CONFIG}>
      <PostProvider>
        <UserContext.Provider value={{ user, setUser, setModalOpen, loading, mutate }}>
          {/* Grain texture overlay — fixed, pointer-events-none, GPU-safe */}
          <GrainOverlay />
          <FrogScrollbar />
          <header className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </header>
          <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          <main role="main">{children}</main>
        </UserContext.Provider>
      </PostProvider>
    </SWRConfig>
  );
}
