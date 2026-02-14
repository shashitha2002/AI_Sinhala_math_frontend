import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as modelPaperService from '../../services/modelPaperService';
import type {
    ShortAnswerQuestion,
    StructuredQuestion,
    EssayQuestion
} from '../../services/modelPaperService';

interface GeneratedPaper {
    short_answer: ShortAnswerQuestion[];
    structured: StructuredQuestion[];
    essay_type: EssayQuestion[];
}

const ModelPaperGenerator: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Question counts
    const [shortAnswerCount, setShortAnswerCount] = useState(5);
    const [structuredCount, setStructuredCount] = useState(3);
    const [essayCount, setEssayCount] = useState(2);

    // Generated paper
    const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(null);
    const [generationTime, setGenerationTime] = useState(0);

    // Load topics on mount
    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const response = await modelPaperService.getAvailableTopics();
            setAvailableTopics(response.available_topics);
        } catch (error) {
            console.error('Failed to load topics:', error);
        }
    };

    const handleTopicToggle = (topic: string) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleGenerateShortAnswer = async () => {
        setLoading(true);
        setLoadingMessage('Generating short answer questions...');
        try {
            const response = await modelPaperService.generateShortAnswer(
                shortAnswerCount,
                selectedTopics.length > 0 ? selectedTopics : undefined
            );
            setGeneratedPaper(prev => ({
                ...prev!,
                short_answer: response.questions as ShortAnswerQuestion[]
            }));
            setGenerationTime(prev => prev + response.generation_time_seconds);
        } catch (error: any) {
            alert('Failed to generate: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateStructured = async () => {
        setLoading(true);
        setLoadingMessage('Generating structured questions...');
        try {
            const response = await modelPaperService.generateStructured(
                structuredCount,
                selectedTopics.length > 0 ? selectedTopics : undefined
            );
            setGeneratedPaper(prev => ({
                ...prev!,
                structured: response.questions as StructuredQuestion[]
            }));
            setGenerationTime(prev => prev + response.generation_time_seconds);
        } catch (error: any) {
            alert('Failed to generate: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateEssay = async () => {
        setLoading(true);
        setLoadingMessage('Generating essay type questions...');
        try {
            const response = await modelPaperService.generateEssay(
                essayCount,
                selectedTopics.length > 0 ? selectedTopics : undefined
            );
            setGeneratedPaper(prev => ({
                ...prev!,
                essay_type: response.questions as EssayQuestion[]
            }));
            setGenerationTime(prev => prev + response.generation_time_seconds);
        } catch (error: any) {
            alert('Failed to generate: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFullPaper = async () => {
        setLoading(true);
        setLoadingMessage('Generating complete model paper... This may take 5-10 minutes.');
        try {
            const response = await modelPaperService.generateFullPaper(
                shortAnswerCount,
                structuredCount,
                essayCount
            );
            setGeneratedPaper(response.questions);
            setGenerationTime(response.generation_time_seconds);
        } catch (error: any) {
            alert('Failed to generate: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const totalQuestions = () => {
        if (!generatedPaper) return 0;
        return (generatedPaper.short_answer?.length || 0) +
            (generatedPaper.structured?.length || 0) +
            (generatedPaper.essay_type?.length || 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-dominant-800 rounded-2xl shadow-2xl p-8 mb-6">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">📝</div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Model Paper Generator
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Generate custom O/L Mathematics model papers using AI
                        </p>
                    </div>

                    {/* Topic Selection */}
                    {availableTopics.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Select Topics (Optional):
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {availableTopics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => handleTopicToggle(topic)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTopics.includes(topic)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-dominant-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dominant-600'
                                            }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Question Count Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                Short Answer (1-10)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={shortAnswerCount}
                                onChange={(e) => setShortAnswerCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded border dark:bg-dominant-800 dark:border-dominant-600"
                            />
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                            <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                Structured (1-5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={structuredCount}
                                onChange={(e) => setStructuredCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded border dark:bg-dominant-800 dark:border-dominant-600"
                            />
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                            <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                                Essay Type (1-5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={essayCount}
                                onChange={(e) => setEssayCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded border dark:bg-dominant-800 dark:border-dominant-600"
                            />
                        </div>
                    </div>

                    {/* Generation Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={handleGenerateShortAnswer}
                            disabled={loading}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            Generate Short
                        </button>
                        <button
                            onClick={handleGenerateStructured}
                            disabled={loading}
                            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            Generate Structured
                        </button>
                        <button
                            onClick={handleGenerateEssay}
                            disabled={loading}
                            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            Generate Essay
                        </button>
                        <button
                            onClick={handleGenerateFullPaper}
                            disabled={loading}
                            className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            Generate Full Paper
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-700 mr-3"></div>
                                <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                                    {loadingMessage}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Generated Questions Preview */}
                {generatedPaper && totalQuestions() > 0 && (
                    <div className="bg-white dark:bg-dominant-800 rounded-2xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    Generated Paper
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {totalQuestions()} questions • Generated in {generationTime.toFixed(1)}s
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/model-paper/take', { state: { generatedPaper } })}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg"
                            >
                                Start Quiz 🚀
                            </button>
                        </div>

                        {/* Questions Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {generatedPaper.short_answer?.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {generatedPaper.short_answer.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Short Answer Questions
                                    </div>
                                </div>
                            )}
                            {generatedPaper.structured?.length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {generatedPaper.structured.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Structured Questions
                                    </div>
                                </div>
                            )}
                            {generatedPaper.essay_type?.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {generatedPaper.essay_type.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Essay Type Questions
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview of first question */}
                        {generatedPaper.short_answer?.[0] && (
                            <div className="mt-6 bg-gray-50 dark:bg-dominant-700 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Preview: Question 1
                                </h4>
                                <p className="text-gray-800 dark:text-gray-200">
                                    {generatedPaper.short_answer[0].question}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelPaperGenerator;
