import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Reset quantity to 1 every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setQuantity(1);
        }, [])
    );

    // Parse product from params
    const product = params.product ? JSON.parse(params.product as string) : null;

    if (!product) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    const handleAddToCart = async () => {
        setLoading(true);
        try {
            await addToCart(product.id, quantity);
            Alert.alert('Success!', 'Product added to cart', [
                { text: 'Continue Shopping', onPress: () => router.back() },
                { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const inStock = product.stock > 0;
    const productPrice = parseFloat(product.price || '0');
    const totalPrice = productPrice * quantity;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View style={styles.heroImageContainer}>
                    {product.images && product.images.length > 0 ? (
                        <Image
                            source={{ uri: product.images[0] }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.heroImage, styles.placeholderHero]}>
                            <Text style={styles.placeholderIcon}>📦</Text>
                            <Text style={styles.placeholderText}>No Image Available</Text>
                        </View>
                    )}
                </View>

                {/* Content Sheet */}
                <View style={styles.contentSheet}>
                    {/* Product Title & Vendor */}
                    <Text style={styles.productTitle}>{product.name}</Text>

                    <View style={styles.vendorRow}>
                        <Text style={styles.vendorLabel}>by </Text>
                        <Text style={styles.vendorName}>{product.vendor?.shop_name}</Text>
                    </View>

                    {/* Price & Stock Badge */}
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{parseFloat(product.price)}</Text>
                        <View style={[styles.stockBadge, !inStock && styles.outOfStockBadge]}>
                            <Text style={[styles.stockText, !inStock && styles.outOfStockText]}>
                                {inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quantity Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quantity</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={!inStock}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityValue}>{quantity}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={!inStock}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        {inStock && (
                            <Text style={styles.stockInfo}>
                                {product.stock} {product.stock === 1 ? 'item' : 'items'} available
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    {product.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}

                    {/* Product Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>
                                {product.category || 'General'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Availability</Text>
                            <Text style={styles.detailValue}>
                                {inStock ? 'In Stock' : 'Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    {/* Spacer for sticky footer */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Sticky Action Bar */}
            <View style={styles.actionBar}>
                <View style={styles.actionBarContent}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addToCartButton, (!inStock || loading) && styles.buttonDisabled]}
                        onPress={handleAddToCart}
                        disabled={!inStock || loading}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#FFFFFF" size="small" />
                                <Text style={styles.buttonText}>Adding...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>
                                {inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    heroImageContainer: {
        width: width,
        height: 350,
        backgroundColor: '#E5E7EB',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    placeholderHero: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    placeholderIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    contentSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -20,
        paddingHorizontal: 20,
        paddingTop: 24,
        minHeight: 400,
    },
    productTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 34,
    },
    vendorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    vendorLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    vendorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10B981',
    },
    stockBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    stockText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    outOfStockBadge: {
        backgroundColor: '#FEE2E2',
    },
    outOfStockText: {
        color: '#DC2626',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quantityButtonText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
    },
    quantityDisplay: {
        marginHorizontal: 20,
        paddingHorizontal: 24,
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    stockInfo: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    description: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    actionBarContent: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        alignItems: 'center',
        gap: 12,
    },
    priceContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
    },
    addToCartButton: {
        flex: 1.5,
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
