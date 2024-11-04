// pages/_app.js
import { useState } from 'react';
import UserContext from '../context/UserContext';
import Navbar from '../components/Shared/Navbar';
import LoginModal from '../components/Auth/LoginModal';
import useAuth from '../hooks/useAuth';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const { user, setUser, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, setModalOpen, loading }}>
      <div className="border-b border-gray-300">
        <Navbar />
      </div>
      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}

export default MyApp;


