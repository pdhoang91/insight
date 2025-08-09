// hooks/useOptimizedSWR.js
import useSWR from 'swr';
import { useCallback, useMemo } from 'react';

// Default fetcher function
const defaultFetcher = async (url) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

// SWR configuration presets
const swrConfigs = {
  // Fast updates for real-time data (comments, likes, etc.)
  realtime: {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  },
  
  // Standard config for most data
  standard: {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  },
  
  // Static data that rarely changes (categories, tags)
  static: {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  },
  
  // User-specific data
  user: {
    refreshInterval: 60000, // 1 minute
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  }
};

export const useOptimizedSWR = (
  key, 
  fetcher = defaultFetcher, 
  options = {}
) => {
  const {
    config = 'standard',
    enabled = true,
    fallbackData,
    onSuccess,
    onError,
    transform,
    ...customOptions
  } = options;

  // Get preset configuration
  const baseConfig = swrConfigs[config] || swrConfigs.standard;
  
  // Combine configurations
  const swrConfig = useMemo(() => ({
    ...baseConfig,
    ...customOptions,
    fallbackData,
    onSuccess: useCallback((data, key, config) => {
      if (onSuccess) onSuccess(data, key, config);
    }, [onSuccess]),
    onError: useCallback((error, key, config) => {
      console.error(`SWR Error for ${key}:`, error);
      if (onError) onError(error, key, config);
    }, [onError])
  }), [baseConfig, customOptions, fallbackData, onSuccess, onError]);

  // Create SWR key (null disables the request)
  const swrKey = enabled ? key : null;
  
  const { data, error, mutate, isLoading, isValidating } = useSWR(
    swrKey,
    fetcher,
    swrConfig
  );

  // Transform data if transformer provided
  const transformedData = useMemo(() => {
    if (!data || !transform) return data;
    try {
      return transform(data);
    } catch (error) {
      console.error('Data transformation error:', error);
      return data;
    }
  }, [data, transform]);

  // Enhanced loading states
  const isFirstLoad = isLoading && !data && !error;
  const isRefreshing = isValidating && data;
  const isEmpty = !isLoading && !data && !error;

  return {
    data: transformedData || data,
    error,
    isLoading: isFirstLoad,
    isRefreshing,
    isValidating,
    isEmpty,
    mutate,
    
    // Helper methods
    refresh: useCallback(() => mutate(), [mutate]),
    
    // Optimistic updates
    updateOptimistic: useCallback((newData, shouldRevalidate = true) => {
      return mutate(newData, { revalidate: shouldRevalidate });
    }, [mutate]),
  };
};

// Specialized hooks for common use cases
export const useRealtimeData = (key, fetcher, options = {}) => {
  return useOptimizedSWR(key, fetcher, { ...options, config: 'realtime' });
};

export const useStaticData = (key, fetcher, options = {}) => {
  return useOptimizedSWR(key, fetcher, { ...options, config: 'static' });
};

export const useUserData = (key, fetcher, options = {}) => {
  return useOptimizedSWR(key, fetcher, { ...options, config: 'user' });
};

// Infinite loading hook with SWR
export const useInfiniteOptimizedSWR = (
  getKey, 
  fetcher = defaultFetcher, 
  options = {}
) => {
  const {
    config = 'standard',
    enabled = true,
    pageSize = 10,
    ...customOptions
  } = options;

  const baseConfig = swrConfigs[config] || swrConfigs.standard;
  
  const swrConfig = useMemo(() => ({
    ...baseConfig,
    ...customOptions
  }), [baseConfig, customOptions]);

  const {
    data,
    error,
    mutate,
    size,
    setSize,
    isLoading,
    isValidating
  } = useSWRInfinite(
    enabled ? getKey : () => null,
    fetcher,
    swrConfig
  );

  // Flatten data from all pages
  const flatData = useMemo(() => {
    if (!data) return [];
    return data.flatMap(page => page.data || []);
  }, [data]);

  // Calculate loading states
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || 
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd = isEmpty || 
    (data && data[data.length - 1]?.data?.length < pageSize);

  return {
    data: flatData,
    error,
    isLoading: isLoadingInitialData,
    isLoadingMore,
    isValidating,
    isEmpty,
    isReachingEnd,
    size,
    setSize,
    mutate,
    
    // Helper methods
    loadMore: useCallback(() => setSize(size + 1), [setSize, size]),
    refresh: useCallback(() => mutate(), [mutate]),
  };
};

export default useOptimizedSWR; 