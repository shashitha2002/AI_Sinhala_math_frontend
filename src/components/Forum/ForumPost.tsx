import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useForum } from '../../hooks/useForum';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import { renderMath } from '../../utils/mathjax';

interface User {
    _id: string;
    name: string;
}

interface Comment {
    _id: string;
    content: string;
    userId: User;
    createdAt: string;
    isModerated?: boolean;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    userId: User;
    createdAt: string;
    topic: string;
    views: number;
    tags: string[];
    comments: Comment[];
}

interface ForumPostProps {
    user?: any;
}

const ForumPost: React.FC<ForumPostProps> = ({ user }) => {
    const { t } = useTranslation();
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const mathContainerRef = React.useRef<HTMLDivElement>(null);

    const { getPost, addComment, loading: forumLoading } = useForum();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (postId) {
            fetchPost(postId);
        }
    }, [postId]);

    useEffect(() => {
        if (post && window.MathJax) {
            setTimeout(() => {
                if (mathContainerRef.current) {
                    renderMath(mathContainerRef.current);
                }
            }, 100);
        }
    }, [post]);

    const fetchPost = async (id: string) => {
        try {
            setInitialLoading(true);
            const data = await getPost(id);
            if (data.success) {
                setPost(data.post);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleAddComment = async (e: FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !postId) return;

        setSubmittingComment(true);
        try {
            const data = await addComment(postId, { content: comment });
            if (data.success) {
                setPost(data.post);
                setComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">{t('common.loading') || 'Loading...'}</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                    {t('forum.postNotFound') || 'Post not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Link
                to="/forum"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                {t('forum.backToForum') || 'Back to Forum'}
            </Link>

            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 transition-colors">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    <span>{t('forum.by') || 'By'} {post.userId?.name || t('forum.unknown') || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{post.topic}</span>
                    <span>•</span>
                    <span>{post.views} {t('forum.views') || 'views'}</span>
                </div>

                <div
                    ref={mathContainerRef}
                    className="prose dark:prose-invert max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="flex gap-2 mb-6">
                    {post.tags?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-sm rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-xl p-8 mb-6 transition-colors">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('forum.commentsSection', { count: post.comments?.length || 0 }) || `Comments (${post.comments?.length || 0})`}
                </h2>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                    <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('forum.addComment') || 'Add a comment...'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dominant-600 rounded-md focus:outline-none focus:ring-primary-500 bg-white dark:bg-dominant-700 text-gray-900 dark:text-gray-100 mb-2"
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submittingComment || !comment.trim()}
                    >
                        {submittingComment ? (t('forum.posting') || 'Posting...') : (t('forum.postComment') || 'Post Comment')}
                    </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment, idx) => (
                            <div key={idx} className="border-l-4 border-primary-200 dark:border-primary-800 pl-4 py-2 bg-gray-50 dark:bg-dominant-700/50 rounded-r-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {comment.userId?.name || t('forum.unknown') || 'Unknown'}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div
                                    className="text-gray-700 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: comment.content }}
                                />
                                {comment.isModerated && (
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">✓ AI {t('forum.moderated') || 'Moderated'}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">{t('forum.noComments') || 'No comments yet.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumPost;
