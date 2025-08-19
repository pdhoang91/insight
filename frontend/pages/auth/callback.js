// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = () => {
      try {
        // Get token from query parameter (?token=...)
        const { token } = router.query;
        
        if (token) {
          // Save token to localStorage
          localStorage.setItem('token', token);
          
          // Redirect to home page
          router.replace('/');
        } else {
          // No token found, redirect to home with error
          console.error('No token found in callback URL');
          router.replace('/?auth=error');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        router.replace('/?auth=error');
      }
    };

    // Only run when router is ready and we have query params
    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router.isReady, router.query]);

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
