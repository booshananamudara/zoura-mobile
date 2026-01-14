import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Zoura</Text>
            <Text style={styles.subtitle}>Your marketplace for everything</Text>
            <View style={styles.card}>
                <Text style={styles.cardText}>
                    Explore products, connect with friends, and more!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    card: {
        marginTop: 32,
        padding: 16,
        backgroundColor: '#DBEAFE',
        borderRadius: 12,
        maxWidth: 300,
    },
    cardText: {
        color: '#1E40AF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
