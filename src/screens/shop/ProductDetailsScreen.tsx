import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

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
            Alert.alert('Success', 'Product added to cart!', [
                { text: 'Continue Shopping', onPress: () => router.back() },
                { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
                {product.images && product.images.length > 0 ? (
                    <Image
                        source={{ uri: product.images[0] }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
            </View>

            {/* Product Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.productName}>{product.name}</Text>

                <View style={styles.vendorContainer}>
                    <Text style={styles.vendorLabel}>Sold by: </Text>
                    <Text style={styles.vendorName}>{product.vendor?.shop_name}</Text>
                </View>

                <Text style={styles.productPrice}>
                    ₹{parseFloat(product.price).toFixed(2)}
                </Text>

                <View style={styles.stockContainer}>
                    <Text style={styles.stockText}>
                        {product.stock > 0
                            ? `${product.stock} in stock`
                            : 'Out of stock'}
                    </Text>
                </View>

                {product.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                )}

                {/* Quantity Selector */}
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Quantity:</Text>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                                setQuantity(Math.min(product.stock, quantity + 1))
                            }
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        (loading || product.stock === 0) && styles.buttonDisabled,
                    ]}
                    onPress={handleAddToCart}
                    disabled={loading || product.stock === 0}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.addToCartText}>
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
    },
    imageContainer: {
        width: '100%',
        height: 300,
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
        color: '#9CA3AF',
        fontSize: 16,
    },
    detailsContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    vendorContainer: {
        flexDirection: 'row',
        marginBottom: 12,
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
    productPrice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 8,
    },
    stockContainer: {
        marginBottom: 16,
    },
    stockText: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
    },
    descriptionContainer: {
        marginTop: 16,
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 16,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    quantityButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    quantityValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        paddingHorizontal: 20,
    },
    addToCartButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
    },
    addToCartText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
