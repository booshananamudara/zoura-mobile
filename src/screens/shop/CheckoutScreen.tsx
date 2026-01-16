import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function CheckoutScreen() {
    const router = useRouter();
    const { totalPrice, checkout, fetchCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

    // Shipping address form
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');

    const validateForm = (): boolean => {
        if (!street.trim()) {
            Alert.alert('Validation Error', 'Please enter your street address');
            return false;
        }
        if (!city.trim()) {
            Alert.alert('Validation Error', 'Please enter your city');
            return false;
        }
        if (!postalCode.trim()) {
            Alert.alert('Validation Error', 'Please enter your postal code');
            return false;
        }
        if (!phone.trim()) {
            Alert.alert('Validation Error', 'Please enter your phone number');
            return false;
        }
        if (phone.length < 10) {
            Alert.alert('Validation Error', 'Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        const shippingAddress = {
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            phone: phone.trim(),
        };

        setLoading(true);
        try {
            await checkout(shippingAddress, paymentMethod);
            // Refresh cart to clear it
            await fetchCart();
            // Navigate to success screen
            router.replace('/(tabs)/order-success');
        } catch (error: any) {
            Alert.alert('Checkout Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Shipping Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Details</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Street Address</Text>
                        <TextInput
                            style={styles.input}
                            value={street}
                            onChangeText={setStreet}
                            placeholder="Enter your street address"
                            placeholderTextColor="#9CA3AF"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                            placeholder="Enter your city"
                            placeholderTextColor="#9CA3AF"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Postal Code</Text>
                        <TextInput
                            style={styles.input}
                            value={postalCode}
                            onChangeText={setPostalCode}
                            placeholder="Enter postal code"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Payment Method Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'cash_on_delivery' && styles.paymentOptionSelected,
                        ]}
                        onPress={() => setPaymentMethod('cash_on_delivery')}
                        disabled={loading}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'cash_on_delivery' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                        <View style={styles.paymentOptionContent}>
                            <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentOptionSubtitle}>Pay when you receive</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, styles.paymentOptionDisabled]}
                        disabled={true}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'card' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                        <View style={styles.paymentOptionContent}>
                            <Text style={[styles.paymentOptionTitle, styles.disabledText]}>
                                Credit/Debit Card
                            </Text>
                            <Text style={[styles.paymentOptionSubtitle, styles.disabledText]}>
                                Coming soon
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{totalPrice}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValueFree}>FREE</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{totalPrice}</Text>
                    </View>
                </View>

                {/* Spacer for button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.buttonContent}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={styles.buttonText}>Placing Order...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Place Order • ₹{totalPrice}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 12,
    },
    paymentOptionSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    paymentOptionDisabled: {
        opacity: 0.5,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
    },
    paymentOptionContent: {
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    paymentOptionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    disabledText: {
        color: '#9CA3AF',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    summaryValueFree: {
        fontSize: 15,
        fontWeight: '600',
        color: '#10B981',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    placeOrderButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
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
        fontSize: 17,
        fontWeight: '600',
    },
});
