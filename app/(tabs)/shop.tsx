import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Refetch products every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

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

    const handleProductPress = (product: Product) => {
        router.push({
            pathname: '/(tabs)/product-details',
            params: {
                product: JSON.stringify(product),
            },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop</Text>
                <Text style={styles.subtitle}>Browse our products</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSubtext}>
                        Make sure the backend is running
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.productCard}
                            onPress={() => handleProductPress(item)}
                        >
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.vendorName}>By {item.vendor.shop_name}</Text>
                            <Text style={styles.stockText}>Stock: {item.stock}</Text>
                            <Text style={styles.productPrice}>
                                ₹{parseFloat(item.price).toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No products available yet</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    stockText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
