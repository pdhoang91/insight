// hooks/useUserProfile.js
import useSWR from 'swr';
import { getUserProfile } from '../services/userService';

export const useUserProfile = () => {
  const { data, error, mutate } = useSWR(`/api/me`, () => getUserProfile());

  return {
    userProfile: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
