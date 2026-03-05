import axios from 'axios';
import apiClient from './apiClient';

const CHATBOT_API_URL = 'http://localhost:5000/api';

const getStudentId = (): string => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user._id || user.id || user.email || 'anonymous';
        }
    } catch { }
    return 'anonymous';
};

export const forumService = {
    getPosts: (params?: any) => apiClient.get('/forum/posts', { params }),
    getPost: (id: string) => apiClient.get(`/forum/posts/${id}`),
    createPost: (data: any) => apiClient.post('/forum/posts', data),
    addComment: (postId: string, data: any) => apiClient.post(`/forum/posts/${postId}/comments`, data),
    likePost: (postId: string, userId: string) => apiClient.post(`/forum/posts/${postId}/like`, null, { params: { user_id: userId } }),
    chatWithGemini: (question: string, chatId: string) =>
        axios.post(`${CHATBOT_API_URL}/answer`, {
            question,
            student_id: getStudentId(),
            chat_id: chatId
        }),
    getChatHistory: () =>
        axios.get(`${CHATBOT_API_URL}/history`, {
            params: { student_id: getStudentId(), limit: 20 }
        }),
    deleteChat: (chatId: string) =>
        axios.post(`${CHATBOT_API_URL}/chat/delete`, {
            chat_id: chatId,
            student_id: getStudentId()
        }),
    renameChat: (chatId: string, title: string) =>
        axios.post(`${CHATBOT_API_URL}/chat/rename`, {
            chat_id: chatId,
            student_id: getStudentId(),
            title
        })
};
