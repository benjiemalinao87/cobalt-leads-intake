// This module provides a consistent way to import axios
// It will use the CDN-loaded axios if available, or the npm package otherwise

// Define a type for the global window with axios
declare global {
  interface Window {
    axios: any;
  }
}

// Try to use the global axios from CDN first, fall back to import
let axiosInstance: any;

try {
  // Check if window.axios exists (from CDN)
  if (typeof window !== 'undefined' && window.axios) {
    axiosInstance = window.axios;
    console.log('Using axios from CDN');
  } else {
    // Fall back to the npm package
    throw new Error('Axios not found on window');
  }
} catch (error) {
  // We'll need to dynamically import axios
  console.log('Falling back to dynamic import of axios');
  
  // This is a placeholder - the dynamic import will be handled where this module is used
  axiosInstance = null;
}

// This function ensures we always have a valid axios instance
export const getAxios = async () => {
  if (axiosInstance) {
    return axiosInstance;
  }
  
  // Dynamic import as a last resort
  try {
    const module = await import('axios');
    axiosInstance = module.default;
    return axiosInstance;
  } catch (error) {
    console.error('Failed to load axios:', error);
    throw new Error('Failed to load axios');
  }
};

export default {
  get: async (url: string, config?: any) => {
    const axios = await getAxios();
    return axios.get(url, config);
  },
  post: async (url: string, data?: any, config?: any) => {
    const axios = await getAxios();
    return axios.post(url, data, config);
  },
  put: async (url: string, data?: any, config?: any) => {
    const axios = await getAxios();
    return axios.put(url, data, config);
  },
  delete: async (url: string, config?: any) => {
    const axios = await getAxios();
    return axios.delete(url, config);
  }
}; 