// pages/_app.js
import { useState } from 'react';
import { PostProvider } from '../context/PostContext'; // Import PostProvider
import UserContext from '../context/UserContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Shared/Footer';
import LoginModal from '../components/Auth/LoginModal';
import useAuth from '../hooks/useAuth';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const { user, setUser, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PostProvider>
      <UserContext.Provider value={{ user, setUser, setModalOpen, loading }}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </UserContext.Provider>
    </PostProvider>
  );
}

export default MyApp;
