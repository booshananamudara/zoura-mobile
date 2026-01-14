import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoItem {
    id: string;
    username: string;
    description: string;
    likes: number;
    comments: number;
    shares: number;
}

const mockVideos: VideoItem[] = [
    {
        id: '1',
        username: '@sarah_travels',
        description: 'Exploring the beautiful mountains 🏔️ #travel #adventure',
        likes: 12500,
        comments: 234,
        shares: 89,
    },
    {
        id: '2',
        username: '@foodie_mike',
        description: 'Best pasta recipe ever! 🍝 #cooking #food',
        likes: 8900,
        comments: 156,
        shares: 45,
    },
    {
        id: '3',
        username: '@fitness_jane',
        description: '30-minute full body workout 💪 #fitness #health',
        likes: 15200,
        comments: 312,
        shares: 128,
    },
    {
        id: '4',
        username: '@tech_guru',
        description: 'Latest smartphone review 📱 #tech #review',
        likes: 9800,
        comments: 189,
        shares: 67,
    },
    {
        id: '5',
        username: '@artist_emma',
        description: 'Time-lapse painting 🎨 #art #creative',
        likes: 11300,
        comments: 245,
        shares: 92,
    },
];

const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export function VideoFeed() {
    const renderVideo = ({ item }: { item: VideoItem }) => (
        <View style={styles.videoContainer}>
            {/* Video Placeholder */}
            <View style={styles.videoPlaceholder} className="bg-gray-800">
                <FontAwesome name="play-circle" size={64} color="#fff" />
                <Text className="mt-4 text-white text-lg">Video Placeholder</Text>
            </View>

            {/* Video Info Overlay */}
            <View style={styles.overlay}>
                {/* Left side - User info */}
                <View style={styles.leftInfo}>
                    <Text style={styles.username} className="text-white font-bold">
                        {item.username}
                    </Text>
                    <Text style={styles.description} className="text-white">
                        {item.description}
                    </Text>
                </View>

                {/* Right side - Action buttons */}
                <View style={styles.rightActions}>
                    {/* Profile */}
                    <View style={styles.actionButton}>
                        <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                            <FontAwesome name="user" size={24} color="#fff" />
                        </View>
                    </View>

                    {/* Like */}
                    <TouchableOpacity style={styles.actionButton}>
                        <FontAwesome name="heart" size={32} color="#fff" />
                        <Text className="text-white text-xs mt-1">
                            {formatNumber(item.likes)}
                        </Text>
                    </TouchableOpacity>

                    {/* Comment */}
                    <TouchableOpacity style={styles.actionButton}>
                        <FontAwesome name="comment" size={32} color="#fff" />
                        <Text className="text-white text-xs mt-1">
                            {formatNumber(item.comments)}
                        </Text>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity style={styles.actionButton}>
                        <FontAwesome name="share" size={32} color="#fff" />
                        <Text className="text-white text-xs mt-1">
                            {formatNumber(item.shares)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <FlatList
            data={mockVideos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={SCREEN_HEIGHT}
            snapToAlignment="start"
            decelerationRate="fast"
        />
    );
}

const styles = StyleSheet.create({
    videoContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'relative',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    leftInfo: {
        flex: 1,
        marginRight: 16,
    },
    username: {
        fontSize: 16,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    rightActions: {
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
});
