import { API_CONFIG } from '@/config/api';

// Note: This file is prepared for future axios integration
// Currently using mock services, so this API client is not actively used
// Remove this file or implement actual HTTP client when connecting to real APIs

export const API_CONFIG_EXPORT = API_CONFIG;

// Placeholder for future API client implementation
export const apiClient = {
  get: (url: string) => console.log('GET', url),
  post: (url: string, data: unknown) => console.log('POST', url, data),
  put: (url: string, data: unknown) => console.log('PUT', url, data),
  delete: (url: string) => console.log('DELETE', url),
}; 