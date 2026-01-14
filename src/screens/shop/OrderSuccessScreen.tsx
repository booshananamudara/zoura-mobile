import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OrderSuccessScreen() {
    const router = useRouter();

    const handleContinueShopping = () => {
        router.push('/(tabs)/shop');
    };

    return (
        <View style={styles.container}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.checkmark}>✓</Text>
            </View>

            {/* Success Message */}
            <Text style={styles.title}>Order Placed Successfully!</Text>
            <Text style={styles.subtitle}>Thank you for your purchase.</Text>
            <Text style={styles.message}>
                Your order has been confirmed and will be processed shortly.
            </Text>

            {/* Continue Shopping Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleContinueShopping}
            >
                <Text style={styles.buttonText}>Continue Shopping</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    checkmark: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#059669',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 40,
        maxWidth: 300,
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
