import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Vendor {
    id: string;
    shop_name: string;
}

interface Product {
    id: string;
    name: string;
    price: string;
    stock: number;
    images: string[];
    vendor: Vendor;
}

interface CartItem {
    id: string;
    quantity: number;
    price_at_add: number;
    product: Product;
}

interface Cart {
    id: string;
    total_price: number;
    items: CartItem[];
}

interface CartContextType {
    cart: Cart | null;
    cartItems: CartItem[];
    totalPrice: number;
    cartCount: number;
    isLoading: boolean;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    fetchCart: () => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TOKEN_KEY = 'access_token';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Derived values
    const cartItems = cart?.items || [];
    const totalPrice = cart?.total_price || 0;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Fetch cart on mount
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) throw new Error('Not authenticated');

            const response = await axios.post(
                `${API_BASE_URL}/cart`,
                { productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCart(response.data.cart);
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to add to cart'
            );
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) throw new Error('Not authenticated');

            const response = await axios.delete(
                `${API_BASE_URL}/cart/${itemId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCart(response.data.cart);
        } catch (error: any) {
            console.error('Error removing from cart:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to remove item'
            );
        }
    };

    const clearCart = async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) throw new Error('Not authenticated');

            await axios.delete(`${API_BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCart(null);
        } catch (error: any) {
            console.error('Error clearing cart:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to clear cart'
            );
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartItems,
                totalPrice,
                cartCount,
                isLoading,
                addToCart,
                fetchCart,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
