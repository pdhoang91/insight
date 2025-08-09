// hooks/useUser.js
import { useContext } from 'react';
import UserContext from '../context/UserContext';

export const useUser = () => {
  return useContext(UserContext);
};

export { useUser };
