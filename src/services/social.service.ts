import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export interface Post {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    content: string;
    image_url: string | null;
    likes_count: number;
    created_at: string;
}

export interface FeedResponse {
    data: Post[];
    total: number;
    limit: number;
    offset: number;
}

class SocialService {
    /**
     * Get social feed
     */
    async getFeed(limit: number = 20, offset: number = 0): Promise<FeedResponse> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/social/feed?limit=${limit}&offset=${offset}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch feed');
            }

            return await response.json();
        } catch (error) {
            console.error('getFeed error:', error);
            throw error;
        }
    }

    /**
     * Create a new post
     * @param content - Post caption/text
     * @param imageUri - Optional local image URI from image picker
     */
    async createPost(content: string, imageUri?: string): Promise<Post> {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const formData = new FormData();
            formData.append('content', content);

            // If image is provided, append it to FormData
            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
            }

            const response = await fetch(`${API_BASE_URL}/social/feed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let the browser/fetch set it with boundary for multipart
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }

            const result = await response.json();
            return result.post;
        } catch (error) {
            console.error('createPost error:', error);
            throw error;
        }
    }
}

export default new SocialService();
