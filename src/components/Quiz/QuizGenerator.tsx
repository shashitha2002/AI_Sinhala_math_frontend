import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizService } from "../../services/quizService";
import { mathGenService as mathAPI } from "../../services/mathGenService";
import { useTranslation } from "../../hooks/useTranslation";
import Button from "../UI/Button";

interface MathTopic {
    sinhala: string;
    english: string;
}

interface QuizGeneratorProps {
    user?: any; // Define User interface later
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ user }) => {
    const { t, isSinhala } = useTranslation();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        topic: "",
        difficulty: "medium",
        numQuestions: 5,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mathTopicsData, setMathTopicsData] = useState<MathTopic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(true);

    // Fetch math topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            setLoadingTopics(true);

            try {
                const mathResponse: any = await mathAPI.getTopics();
                if (mathResponse.topics) {
                    setMathTopicsData(mathResponse.topics);
                    // Set default topic to first one
                    if (mathResponse.topics.length > 0) {
                        setFormData((prev) => ({
                            ...prev,
                            topic: mathResponse.topics[0].sinhala,
                        }));
                    } else {
                        // Fallback if topics array is empty but success
                        setFormData((prev) => ({
                            ...prev,
                            topic: "වාරික ගණනය",
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching math topics:", err);
                const defaultTopics: MathTopic[] = [
                    { sinhala: "වාරික ගණනය", english: "Installments" },
                    { sinhala: "සරල පොලිය", english: "Simple Interest" },
                    { sinhala: "ලාභ හානි", english: "Profit & Loss" },
                ];
                setMathTopicsData(defaultTopics);
                setFormData((prev) => ({
                    ...prev,
                    topic: defaultTopics[0].sinhala,
                }));
            }

            setLoadingTopics(false);
        };

        fetchTopics();
    }, []);

    const handleNavigateModelPaper = () => {
        navigate("/quiz/model-paper");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "numQuestions" ? parseInt(value) || 5 : value,
        }));
    };

    // Handle Sinhala Math Quiz - Navigate to MathQuizTaking with params
    const handleGenerateMathQuiz = () => {
        setError("");

        navigate("/math-quiz", {
            state: {
                topic: formData.topic || mathTopicsData[0]?.sinhala || "වාරික ගණනය",
                difficulty: formData.difficulty,
                numQuestions: formData.numQuestions,
                autoGenerate: true,
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="card shadow-xl p-4 sm:p-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dominant-900 dark:text-dominant-50 mb-4 sm:mb-6 flex items-center gap-2">
                    <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-accent-500 dark:text-accent-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    {t("quiz.quizGenerator")}
                </h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Quiz Configuration Section */}
                <div className="mb-6 p-4 bg-dominant-50 dark:bg-dominant-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-dominant-600 dark:text-dominant-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {t("quiz.quizSettings") || "Quiz Settings"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Topic Selection */}
                        <div>
                            <label
                                htmlFor="topic"
                                className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2"
                            >
                                {t("quiz.topic") || "විෂය මාතෘකාව (Topic)"}
                            </label>
                            <select
                                id="topic"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                disabled={loadingTopics}
                                className="input disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingTopics ? (
                                    <option value="">{t("common.loading")}...</option>
                                ) : (
                                    mathTopicsData.map((topic, idx) => (
                                        <option key={idx} value={topic.sinhala}>
                                            {isSinhala
                                                ? topic.sinhala
                                                : `${topic.sinhala} (${topic.english})`}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Difficulty Selection */}
                        <div>
                            <label
                                htmlFor="difficulty"
                                className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2"
                            >
                                {t("quiz.difficulty") || "අපහසුතා මට්ටම (Difficulty)"}
                            </label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="easy">{t("quiz.easy") || "පහසු (Easy)"}</option>
                                <option value="medium">
                                    {t("quiz.medium") || "මධ්‍යම (Medium)"}
                                </option>
                                <option value="hard">{t("quiz.hard") || "අපහසු (Hard)"}</option>
                            </select>
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label
                                htmlFor="numQuestions"
                                className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2"
                            >
                                {t("quiz.numberOfQuestions") || "ප්‍රශ්න ගණන (Questions)"}
                            </label>
                            <select
                                id="numQuestions"
                                name="numQuestions"
                                value={formData.numQuestions}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={7}>7</option>
                                <option value={10}>10</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Quiz Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    {/* Sinhala Math Quiz (AI Generated) */}
                    <div className="card border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-xl font-semibold text-dominant-900 dark:text-dominant-50 flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                                සිංහල ගණිත ප්‍රශ්න
                            </h2>
                            <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                AI Generated
                            </span>
                        </div>

                        <p className="text-sm text-dominant-600 dark:text-dominant-400 mb-2">
                            Sinhala Math Questions with Step-by-Step Solutions
                        </p>

                        <ul className="text-xs text-dominant-500 dark:text-dominant-500 mb-4 space-y-1">
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                පියවරෙන් පියවර විසඳුම් (Step-by-step solutions)
                            </li>
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                ගණිත අංකන බොත්තම් (Math notation buttons)
                            </li>
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                O/L විභාග මට්ටම (O/L exam level)
                            </li>
                        </ul>

                        {/* Selected Options Preview */}
                        <div className="mb-4 p-2 bg-white dark:bg-dominant-900 rounded text-xs text-dominant-600 dark:text-dominant-400">
                            <span className="font-medium">Selected: </span> {formData.topic} •{" "}
                            {formData.difficulty} • {formData.numQuestions} questions
                        </div>

                        <Button
                            onClick={handleGenerateMathQuiz}
                            variant="primary"
                            disabled={loading || loadingTopics}
                            fullWidth
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {t("quiz.generating")}
                                </span>
                            ) : (
                                "ප්‍රශ්න ජනනය කරන්න (Generate)"
                            )}
                        </Button>
                    </div>

                    {/* Model Paper */}
                    <div className="card border-2 border-dashed border-accent-300 dark:border-accent-700 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-xl font-semibold text-dominant-900 dark:text-dominant-50 flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-accent-600 dark:text-accent-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                {t("quiz.modelPaper") || "ආදර්ශ ප්‍රශ්න පත්‍රය"}
                            </h2>
                            <span className="text-xs bg-accent-200 dark:bg-accent-800 text-accent-800 dark:text-accent-200 px-2 py-1 rounded-full">
                                Full Exam
                            </span>
                        </div>

                        <p className="text-sm text-dominant-600 dark:text-dominant-400 mb-2">
                            {t("quiz.fullExamDescription") || "Complete O/L Model Paper"}
                        </p>

                        <ul className="text-xs text-dominant-500 dark:text-dominant-500 mb-4 space-y-1">
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                සම්පූර්ණ විභාග ආකෘතිය (Full exam format)
                            </li>
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                කාල සීමාව (Time limit)
                            </li>
                            <li className="flex items-center gap-1">
                                <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                සියලුම මාතෘකා (All topics)
                            </li>
                        </ul>

                        <Button
                            onClick={handleNavigateModelPaper}
                            variant="primary"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {t("quiz.generating")}
                                </span>
                            ) : (
                                t("quiz.generateModelPaper") || "ආදර්ශ පත්‍රය ජනනය කරන්න"
                            )}
                        </Button>
                    </div>
                </div>

                {/* Quiz History */}
                <div className="mt-6 sm:mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-dominant-900 dark:text-dominant-50 mb-3 sm:mb-4 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-dominant-600 dark:text-dominant-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {t("quiz.quizHistory") || "ප්‍රශ්නාවලි ඉතිහාසය"}
                    </h2>
                    <QuizHistoryList />
                </div>
            </div>
        </div>
    );
};

// Quiz History Component
const QuizHistoryList: React.FC = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<any[]>([]); // Define Quiz type properly later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response: any = await quizService.getHistory();
                if (response.data.success) {
                    setHistory(response.data.quizzes);
                }
            } catch (error) {
                console.error("Error fetching quiz history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <svg
                    className="animate-spin h-6 w-6 text-dominant-400"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-dominant-500 dark:text-dominant-400">
                <svg
                    className="w-12 h-12 mx-auto mb-3 text-dominant-300 dark:text-dominant-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
                <p>{t("progress.noQuizHistory") || "No quiz history yet"}</p>
                <p className="text-sm mt-1">Generate your first quiz above! </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {history.slice(0, 5).map((quiz, idx) => (
                <div
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-dominant-50 dark:bg-dominant-900 rounded-lg hover:bg-dominant-100 dark:hover:bg-dominant-800 transition-colors border border-dominant-200 dark:border-dominant-700"
                >
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate text-dominant-900 dark:text-dominant-50">
                            {quiz.type.replace("-", " ").toUpperCase()}
                        </p>
                        <p className="text-xs sm:text-sm text-dominant-600 dark:text-dominant-400">
                            {new Date(quiz.timeStarted || quiz.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        {quiz.status === "completed" && quiz.score ? (
                            <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${quiz.score.percentage >= 70
                                    ? "bg-success-100 dark:bg-success-900/50 text-success-800 dark:text-success-300"
                                    : quiz.score.percentage >= 50
                                        ? "bg-secondary-100 dark:bg-secondary-900/50 text-secondary-800 dark:text-secondary-300"
                                        : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                                    }`}
                            >
                                {quiz.score.percentage.toFixed(1)}%
                            </span>
                        ) : (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-dominant-200 dark:bg-dominant-700 text-dominant-700 dark:text-dominant-300">
                                {quiz.status}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuizGenerator;
