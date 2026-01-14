// API Configuration
// Update the BASE_URL based on your environment:
// - Android Emulator: http://10.0.2.2:8080
// - iOS Simulator: http://localhost:8080
// - Physical Device: http://<YOUR_IP>:8080 (e.g., http://192.168.1.66:8080)

export const API_BASE_URL = 'http://192.168.1.66:8080';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',

    // Products
    PRODUCTS: '/products',
};
