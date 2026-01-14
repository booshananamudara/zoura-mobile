import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import '../global.css';

interface Vendor {
    id: string;
    shop_name: string;
    email: string;
}

interface Product {
    id: string;
    name: string;
    price: string;
    stock: number;
    images: string[];
    approval_status: string;
    vendor: Vendor;
    created_at: string;
}

// ======================================
// IMPORTANT: UPDATE THIS IP ADDRESS
// ======================================
// For Android emulator: Use 10.0.2.2
// For iOS simulator: Use localhost or 127.0.0.1
// For physical device: Use your computer's local IP address
// 
// To find your IP on Windows: 
//   Run: ipconfig
//   Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)
//
// Example: const API_URL = 'http://192.168.1.5:8080/products';
//
const API_URL = 'http://192.168.1.66:8080/products';  // Your computer's IP

export default function ShopScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // API returns { products: [...], total: number }
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error instanceof Error ? error.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container} className="flex-1 bg-white dark:bg-gray-900">
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    Shop
                </Text>
                <Text className="mt-1 text-gray-600 dark:text-gray-300">
                    Browse our products
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading products...
                    </Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-red-600 dark:text-red-400 text-center">
                        {error}
                    </Text>
                    <Text className="mt-2 text-gray-600 dark:text-gray-400 text-center">
                        Make sure the backend is running on http://10.0.2.2:8080
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="p-4 mx-4 my-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                {item.name}
                            </Text>
                            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                By {item.vendor.shop_name}
                            </Text>
                            <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                Stock: {item.stock}
                            </Text>
                            <Text className="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                                ₹{parseFloat(item.price).toFixed(2)}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center p-8">
                            <Text className="text-gray-600 dark:text-gray-400 text-center">
                                No products available yet
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
