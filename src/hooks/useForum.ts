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

    const chatWithGemini = useCallback(async (question: string, chatId: string) => {
        try {
            const response = await forumService.chatWithGemini(question, chatId);
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }, []);

    const getChatHistory = useCallback(async () => {
        try {
            const response = await forumService.getChatHistory();
            return response.data;
        } catch (err: any) {
            console.error('Failed to load chat history:', err);
            return { chats: [] };
        }
    }, []);

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            const response = await forumService.deleteChat(chatId);
            return response.data;
        } catch (err: any) {
            console.error('Failed to delete chat:', err);
            throw err;
        }
    }, []);

    const renameChat = useCallback(async (chatId: string, title: string) => {
        try {
            const response = await forumService.renameChat(chatId, title);
            return response.data;
        } catch (err: any) {
            console.error('Failed to rename chat:', err);
            throw err;
        }
    }, []);

    return { getPosts, getPost, createPost, addComment, chatWithGemini, getChatHistory, deleteChat, renameChat, loading, error };
};
