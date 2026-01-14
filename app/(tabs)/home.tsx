import { View, Text, StyleSheet } from 'react-native';
import '../global.css';

export default function HomeScreen() {
    return (
        <View style={styles.container} className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
            <Text style={styles.title} className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to Zoura
            </Text>
            <Text style={styles.subtitle} className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Your marketplace for everything
            </Text>
            <View className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Text className="text-blue-900 dark:text-blue-100">
                    Explore products, connect with friends, and more!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        marginTop: 16,
    },
});
