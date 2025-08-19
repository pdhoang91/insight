// hooks/useLoginModal.js
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';

export const useLoginModal = (isOpen, onClose) => {
  const { user } = useUser();

  useEffect(() => {
    if (user && isOpen) {
      // Nếu đã đăng nhập và modal đang mở, đóng modal
      onClose();
    }
  }, [user, isOpen, onClose]);
};

