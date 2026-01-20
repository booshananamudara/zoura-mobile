import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import socialService, { Post } from '../../services/social.service';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const { width } = Dimensions.get('window');

interface UserProfile {
    id: string;
    email: string;
    name: string;
    subscription_tier?: string;
}

export default function FeedScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        loadFeed();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const loadFeed = async () => {
        try {
            setError(null);
            const response = await socialService.getFeed(20, 0);
            setPosts(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFeed();
        setRefreshing(false);
    }, []);

    const handleCreatePost = () => {
        if (!profile?.subscription_tier || profile.subscription_tier === 'FREE') {
            Alert.alert(
                'Upgrade Required',
                'You must be a Silver, Gold, or Platinum member to post. Please upgrade your subscription to share content!',
                [{ text: 'OK' }]
            );
            return;
        }

        router.push('/create-post');
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    };

    const renderPost = ({ item }: { item: Post }) => (
        <View style={styles.postCard}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.user.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
                </View>
            </View>

            {/* Image */}
            {item.image_url && (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.likeSection}>
                    <Ionicons name="heart-outline" size={24} color="#EF4444" />
                    <Text style={styles.likeCount}>{item.likes_count}</Text>
                </View>
                <Text style={styles.caption}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    {' '}
                    {item.content}
                </Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadFeed}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleCreatePost}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 80,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    postCard: {
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    postImage: {
        width: width,
        height: width,
        backgroundColor: '#F3F4F6',
    },
    footer: {
        padding: 12,
    },
    likeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    likeCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 8,
    },
    caption: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
