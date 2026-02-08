import { useState, useCallback } from 'react';
import { forumService } from '../services/forumService';

export const useForum = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPosts = useCallback(async (params?: any) => {
        setLoading(true);
        try {
            const response = await forumService.getPosts(params);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch posts');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPost = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const response = await forumService.getPost(id);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch post');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await forumService.createPost(data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to create post');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addComment = useCallback(async (postId: string, data: any) => {
        setLoading(true);
        try {
            const response = await forumService.addComment(postId, data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to add comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const chatWithGemini = useCallback(async (question: string) => {
        // Chat doesn't necessarily block other operations, but we can track loading
        // For chat UI, usually local loading state is better, but we return the promise
        try {
            const response = await forumService.chatWithGemini(question);
            return response.data;
        } catch (err: any) {
            // Let the component handle specific chat errors
            throw err;
        }
    }, []);

    return { getPosts, getPost, createPost, addComment, chatWithGemini, loading, error };
};
