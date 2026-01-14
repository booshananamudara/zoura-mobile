import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { VideoFeed } from '@/components/VideoFeed';
import '../global.css';

export default function SocialScreen() {
    return (
        <View style={styles.container} className="flex-1 bg-black">
            <VideoFeed />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
