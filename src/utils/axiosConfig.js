import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: '/api', // Can be modified for production using process.env
});

// Request interceptor for adding the bearer token
axiosInstance.interceptors.request.use(
    (config) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
