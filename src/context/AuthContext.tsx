import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'access_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on app launch
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                // Fetch user profile
                const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid token
            await AsyncStorage.removeItem(TOKEN_KEY);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
                email,
                password,
            });

            const { access_token } = response.data;

            // Save token
            await AsyncStorage.setItem(TOKEN_KEY, access_token);

            // Fetch user profile
            const profileResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            setUser(profileResponse.data);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
                name,
                email,
                password,
            });

            // After successful registration, automatically log in
            await login(email, password);
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
