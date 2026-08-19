import Axios from 'axios';

const adminAxios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    // Crucially, we DO NOT use withCredentials here. We want to bypass the session cookie
    // and rely solely on the Bearer token for admin API calls.
});

adminAxios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

export default adminAxios;
