import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelPaperService } from '../../services/modelPaperService';

const ModelPaperGenerate: React.FC = () => {
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        setProgress('විභාග ප්‍රශ්න පත්‍රය ජනනය වෙමින් පවතී... මෙය මිනිත්තු 3-5 ක් ගත විය හැක.');

        try {
            //this is the point I have put the sample for the frontend development
            const result = await modelPaperService.generateFullPaper({
                short_answer_count: 25,
                structured_count: 5,
                essay_count: 10,
            });

            if (result.success) {
                setProgress('සාර්ථකයි! විභාගය ආරම්භ කරමින්...');
                // Navigate to exam with paper_id
                setTimeout(() => {
                    navigate('/quiz/model-paper/exam', {
                        state: { paperId: result.paper_id },
                    });
                }, 1000);
            } else {
                setError('Failed to generate paper');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📝</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        O/L ගණිත ආදර්ශ ප්‍රශ්න පත්‍රය
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        O/L Mathematics Model Paper
                    </p>
                </div>

                {/* Paper Structure */}
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg space-y-3">
                    <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">
                        පත්‍රයේ ව්‍යුහය (Paper Structure):
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">25</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">කෙටි පිළිතුරු</div>
                            <div className="text-xs text-gray-500">Short Answer</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">5</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">ව්‍යුහගත</div>
                            <div className="text-xs text-gray-500">Structured</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">10</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">රචනා</div>
                            <div className="text-xs text-gray-500">Essay</div>
                        </div>
                    </div>
                </div>

                {/* Rules */}
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2">
                        ⚠️ විභාග නීති:
                    </h3>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                        <li>• කාල සීමාව: පැය 3 (3 hours)</li>
                        <li>• විභාගය ආරම්භ කළ පසු ආපසු යාම නොහැක</li>
                        <li>• කාලය අවසන් වූ පසු ස්වයංක්‍රීයව ඉදිරිපත් වේ</li>
                        <li>• පිළිතුරු සෑම මිනිත්තුවකම ස්වයංක්‍රීයව සුරැකේ</li>
                    </ul>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {progress && generating && (
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        {progress}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 
                               text-white text-lg font-bold rounded-xl transition-colors shadow-lg"
                >
                    {generating ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ජනනය වෙමින්... (Generating...)
                        </span>
                    ) : (
                        'පත්‍රය ජනනය කර විභාගය ආරම්භ කරන්න'
                    )}
                </button>

                <button
                    onClick={() => navigate('/quiz/generate')}
                    disabled={generating}
                    className="w-full mt-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                               text-sm disabled:opacity-50"
                >
                    ← ආපසු යන්න (Go Back)
                </button>
            </div>
        </div>
    );
};

export default ModelPaperGenerate;