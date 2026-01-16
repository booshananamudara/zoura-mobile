import React, { useState, useCallback, useRef, useMemo } from 'react';
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
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

interface ProductVariant {
    id: string;
    color: string | null;
    size: string | null;
    sku: string;
    stock: number;
    price_override: number | null;
}

interface ProductAttributes {
    [key: string]: string;
}

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addToCart } = useCart();
    const scrollViewRef = useRef<ScrollView>(null);

    // Loading and UI states
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Variant selection states
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Reset states when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setQuantity(1);
            setSelectedColor(null);
            setSelectedSize(null);
            setCurrentImageIndex(0);
        }, [])
    );

    // Parse product from params
    const product = params.product ? JSON.parse(params.product as string) : null;

    // ===== COMPUTED VALUES =====
    
    // Get unique colors and sizes from variants
    const availableColors = useMemo(() => {
        if (!product?.variants) return [];
        const colors = product.variants
            .map((v: ProductVariant) => v.color)
            .filter((c: string | null): c is string => c !== null && c !== '');
        return [...new Set(colors)];
    }, [product?.variants]);

    const availableSizes = useMemo(() => {
        if (!product?.variants) return [];
        const sizes = product.variants
            .map((v: ProductVariant) => v.size)
            .filter((s: string | null): s is string => s !== null && s !== '');
        return [...new Set(sizes)];
    }, [product?.variants]);

    // Find the selected variant based on color/size selection
    const selectedVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;

        // If product has only one variant and no color/size options, select it automatically
        if (product.variants.length === 1 && availableColors.length === 0 && availableSizes.length === 0) {
            return product.variants[0];
        }

        // Find variant matching both color and size
        return product.variants.find((v: ProductVariant) => {
            const colorMatch = !availableColors.length || v.color === selectedColor;
            const sizeMatch = !availableSizes.length || v.size === selectedSize;
            return colorMatch && sizeMatch;
        }) || null;
    }, [product?.variants, selectedColor, selectedSize, availableColors.length, availableSizes.length]);

    // Calculate display price (base + override)
    const displayPrice = useMemo(() => {
        const basePrice = parseFloat(product?.price || '0');
        if (selectedVariant?.price_override) {
            return basePrice + parseFloat(selectedVariant.price_override.toString());
        }
        return basePrice;
    }, [product?.price, selectedVariant]);

    // Calculate total stock available
    const availableStock = useMemo(() => {
        if (selectedVariant) {
            return selectedVariant.stock;
        }
        // Sum all variant stocks if no variant selected
        if (product?.variants) {
            return product.variants.reduce((sum: number, v: ProductVariant) => sum + v.stock, 0);
        }
        return 0;
    }, [selectedVariant, product?.variants]);

    // Check if variant selection is complete
    const isVariantSelected = useMemo(() => {
        // No variants exist - allow purchase
        if (!product?.variants || product.variants.length === 0) return true;
        // Single variant with no options - auto-select
        if (product.variants.length === 1 && availableColors.length === 0 && availableSizes.length === 0) return true;
        // Needs color but not selected
        if (availableColors.length > 0 && !selectedColor) return false;
        // Needs size but not selected
        if (availableSizes.length > 0 && !selectedSize) return false;
        return true;
    }, [product?.variants, availableColors.length, availableSizes.length, selectedColor, selectedSize]);

    // ===== HANDLERS =====

    const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentImageIndex(index);
    };

    const handleAddToCart = async () => {
        if (!isVariantSelected) {
            const missingFields = [];
            if (availableColors.length > 0 && !selectedColor) missingFields.push('color');
            if (availableSizes.length > 0 && !selectedSize) missingFields.push('size');
            Alert.alert('Select Options', `Please select a ${missingFields.join(' and ')}`);
            return;
        }

        if (!selectedVariant && product?.variants?.length > 0) {
            Alert.alert('Error', 'Selected variant not found');
            return;
        }

        setLoading(true);
        try {
            // Pass variantId if available, otherwise just productId
            const variantId = selectedVariant?.id || undefined;
            await addToCart(product.id, quantity, variantId);
            
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

    // ===== RENDER =====

    if (!product) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [];
    const attributes: ProductAttributes = product.attributes || {};
    const inStock = availableStock > 0;
    const totalPrice = displayPrice * quantity;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ===== IMAGE CAROUSEL ===== */}
                <View style={styles.heroImageContainer}>
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={handleImageScroll}
                                decelerationRate="fast"
                            >
                                {images.map((imageUrl: string, index: number) => (
                                    <Image
                                        key={index}
                                        source={{ uri: imageUrl }}
                                        style={styles.heroImage}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                            {/* Pagination Dots */}
                            {images.length > 1 && (
                                <View style={styles.paginationContainer}>
                                    {images.map((_: string, index: number) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.paginationDot,
                                                index === currentImageIndex && styles.paginationDotActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </>
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
                        <Text style={styles.vendorName}>{product.vendor?.shop_name || 'Zoura'}</Text>
                    </View>

                    {/* Price & Stock Badge */}
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.price}>₹{displayPrice.toFixed(2)}</Text>
                            {selectedVariant?.price_override && (
                                <Text style={styles.priceOverrideNote}>
                                    (Base: ₹{parseFloat(product.price).toFixed(2)} + ₹{parseFloat(selectedVariant.price_override.toString()).toFixed(2)})
                                </Text>
                            )}
                        </View>
                        <View style={[styles.stockBadge, !inStock && styles.outOfStockBadge]}>
                            <Text style={[styles.stockText, !inStock && styles.outOfStockText]}>
                                {inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* ===== COLOR SELECTOR ===== */}
                    {availableColors.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Color {selectedColor && <Text style={styles.selectedLabel}>- {selectedColor}</Text>}
                            </Text>
                            <View style={styles.chipContainer}>
                                {availableColors.map((color: string) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.chip,
                                            selectedColor === color && styles.chipSelected,
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    >
                                        <View style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]} />
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selectedColor === color && styles.chipTextSelected,
                                            ]}
                                        >
                                            {color}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ===== SIZE SELECTOR ===== */}
                    {availableSizes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Size {selectedSize && <Text style={styles.selectedLabel}>- {selectedSize}</Text>}
                            </Text>
                            <View style={styles.chipContainer}>
                                {availableSizes.map((size: string) => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[
                                            styles.sizeChip,
                                            selectedSize === size && styles.chipSelected,
                                        ]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selectedSize === size && styles.chipTextSelected,
                                            ]}
                                        >
                                            {size}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Variant Stock Info */}
                    {selectedVariant && (
                        <View style={styles.variantInfo}>
                            <Text style={styles.variantInfoText}>
                                SKU: {selectedVariant.sku} • {selectedVariant.stock} available
                            </Text>
                        </View>
                    )}

                    {/* ===== QUANTITY SELECTOR ===== */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quantity</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={!inStock || !isVariantSelected}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityValue}>{quantity}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                disabled={!inStock || !isVariantSelected}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ===== ATTRIBUTES SECTION ===== */}
                    {Object.keys(attributes).length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Product Details</Text>
                            {Object.entries(attributes).map(([key, value]) => (
                                <View key={key} style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{key}</Text>
                                    <Text style={styles.detailValue}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Description */}
                    {product.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </View>
                    )}

                    {/* Spacer for sticky footer */}
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* ===== STICKY ACTION BAR ===== */}
            <View style={styles.actionBar}>
                <View style={styles.actionBarContent}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.addToCartButton,
                            (!inStock || loading || !isVariantSelected) && styles.buttonDisabled,
                        ]}
                        onPress={handleAddToCart}
                        disabled={!inStock || loading || !isVariantSelected}
                    >
                        {loading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#FFFFFF" size="small" />
                                <Text style={styles.buttonText}>Adding...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>
                                {!inStock
                                    ? 'Out of Stock'
                                    : !isVariantSelected
                                    ? 'Select Options'
                                    : 'Add to Cart'}
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
        height: 380,
        backgroundColor: '#E5E7EB',
    },
    heroImage: {
        width: width,
        height: 380,
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
    paginationContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        backgroundColor: '#FFFFFF',
        width: 24,
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
        fontSize: 26,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 32,
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
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    price: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#10B981',
    },
    priceOverrideNote: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    selectedLabel: {
        fontWeight: '400',
        color: '#6B7280',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    chipSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    sizeChip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        minWidth: 50,
        alignItems: 'center',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    chipTextSelected: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    variantInfo: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    variantInfoText: {
        fontSize: 13,
        color: '#6B7280',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
