import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
    const router = useRouter();
    const { cartItems, totalPrice, isLoading, fetchCart, removeFromCart, checkout } = useCart();
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Refetch cart every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const handleRemoveItem = (itemId: string, productName: string) => {
        Alert.alert(
            'Remove Item',
            `Remove "${productName}" from cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeFromCart(itemId);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Cart Empty', 'Please add some items to your cart first.');
            return;
        }

        // Navigate to checkout screen instead of directly calling checkout
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading cart...</Text>
            </View>
        );
    }

    if (cartItems.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptyText}>Add some products to get started!</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => router.push('/(tabs)/shop')}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        {/* Product Image */}
                        <View style={styles.imageContainer}>
                            {item.product.images && item.product.images.length > 0 ? (
                                <Image
                                    source={{ uri: item.product.images[0] }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.placeholderText}>📦</Text>
                                </View>
                            )}
                        </View>

                        {/* Product Details */}
                        <View style={styles.detailsContainer}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.vendorName}>
                                {item.product.vendor.shop_name}
                            </Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                                <Text style={styles.price}>
                                    ₹{(parseFloat(item.price_at_add.toString()) * item.quantity)}
                                </Text>
                            </View>
                        </View>

                        {/* Remove Button */}
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveItem(item.id, item.product.name)}
                        >
                            <Text style={styles.removeIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.checkoutButton,
                        (checkoutLoading || cartItems.length === 0) && styles.buttonDisabled
                    ]}
                    onPress={handleCheckout}
                    disabled={checkoutLoading || cartItems.length === 0}
                >
                    {checkoutLoading ? (
                        <View style={styles.buttonContent}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={styles.checkoutText}>Processing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    shopButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    placeholderText: {
        fontSize: 32,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 14,
        color: '#6B7280',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    removeButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIcon: {
        fontSize: 24,
    },
    footer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 16,
        paddingBottom: 24,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    checkoutButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
