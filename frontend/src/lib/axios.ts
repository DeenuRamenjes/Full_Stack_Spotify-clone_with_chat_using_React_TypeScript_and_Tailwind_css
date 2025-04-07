import axios from 'axios';

const baseURL = import.meta.env.MODE === "development" 
    ? "http://localhost:5000/api" 
    : "https://spotify-chat-jqzp.onrender.com/api";

export const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000, // 5 minutes timeout
    maxContentLength: 50 * 1024 * 1024, // 50MB
    maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Add request interceptor to handle authentication and file uploads
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the auth token from Clerk
        const token = localStorage.getItem('__clerk_client_jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If the request contains FormData, remove the Content-Type header
        // to let the browser set it with the correct boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
            return Promise.reject(new Error('Request timeout. Please try again.'));
        }
        return Promise.reject(error);
    }
);