import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
        id: string;
        name: string;
    };
}

interface Order {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

const TOKEN_KEY = 'access_token';

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem(TOKEN_KEY);

            if (!token) {
                setError('Please login to view orders');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(response.data);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { backgroundColor: '#FEF3C7', color: '#D97706' };
            case 'SHIPPED':
                return { backgroundColor: '#DBEAFE', color: '#2563EB' };
            case 'DELIVERED':
                return { backgroundColor: '#D1FAE5', color: '#059669' };
            case 'CANCELLED':
                return { backgroundColor: '#FEE2E2', color: '#DC2626' };
            default:
                return { backgroundColor: '#F3F4F6', color: '#6B7280' };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatOrderId = (id: string) => {
        return `#${id.substring(0, 8).toUpperCase()}`;
    };

    const renderOrderCard = ({ item: order }: { item: Order }) => {
        const statusStyle = getStatusBadgeStyle(order.status);

        return (
            <View style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.orderId}>Order {formatOrderId(order.id)}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                </View>

                {/* Items List */}
                <View style={styles.itemsContainer}>
                    {order.items.map((item) => (
                        <Text key={item.id} style={styles.itemText}>
                            {item.product.name} × {item.quantity}
                        </Text>
                    ))}
                </View>

                {/* Footer Row */}
                <View style={styles.footerRow}>
                    <Text style={styles.totalPrice}>
                        ₹{parseFloat(order.total_amount.toString()).toFixed(2)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {order.status}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Orders</Text>
                <Text style={styles.subtitle}>{orders.length} order(s)</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptyText}>
                        Your order history will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
        padding: 24,
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    orderDate: {
        fontSize: 13,
        color: '#6B7280',
    },
    itemsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 12,
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
