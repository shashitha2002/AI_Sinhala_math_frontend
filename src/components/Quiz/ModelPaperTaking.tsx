import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { MODEL_PAPER_DATA } from "../../data/modelPaperData";
import { transformGeneratedPaper } from "../../utils/modelPaperTransformer";
import type { Question, Section } from "../../data/modelPaperData";

interface AnswersState {
    [questionId: number]: {
        steps: { [stepIndex: number]: string };
        finalAnswer: string;
    };
}

interface SelectedOptionsState {
    [questionId: number]: string;
}

interface ToggleState {
    [questionId: number]: boolean;
}

interface SectionScore {
    correct: number;
    total: number;
    marks: number;
    obtained: number;
    percentage: number;
}

interface ScoreResult {
    correct: number;
    total: number;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    sectionScores: { [sectionId: string]: SectionScore };
}

interface ModelPaperTakingProps {
    user?: any;
    generatedPaper?: any; // Backend-generated paper
}

const ModelPaperTaking: React.FC<ModelPaperTakingProps> = ({ user, generatedPaper }) => {
    const { t, currentLanguage, changeLanguage } = useTranslation();
    const navigate = useNavigate();

    // Debug logging
    console.log('ModelPaperTaking - generatedPaper:', generatedPaper);

    // Use generated paper if available, otherwise use static data
    const modelPaperData = generatedPaper
        ? transformGeneratedPaper(generatedPaper)
        : MODEL_PAPER_DATA;

    console.log('ModelPaperTaking - modelPaperData:', modelPaperData);

    // State
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<AnswersState>({});
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsState>({});
    const [showGuidelines, setShowGuidelines] = useState<ToggleState>({});
    const [showSolution, setShowSolution] = useState<ToggleState>({});
    const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState(modelPaperData.duration * 60);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Safety check: if no questions exist, show error
    if (!modelPaperData.sections || modelPaperData.sections.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dominant-900">
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-6xl mb-4 text-center">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                        No Questions Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                        Please generate questions first before starting the quiz.
                    </p>
                    <button
                        onClick={() => navigate('/quiz/model-paper')}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Go to Generator
                    </button>
                </div>
            </div>
        );
    }

    // Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Timer effect
    useEffect(() => {
        if (!isSubmitted && !showInstructions && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSubmitted, showInstructions]);

    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showLanguageDropdown && !(e.target as Element).closest(".language-dropdown-container")) {
                setShowLanguageDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showLanguageDropdown]);

    // Helper functions
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getCurrentQuestion = (): Question => modelPaperData.sections[currentSection]?.questions[currentQuestion];

    const getAllQuestions = () => {
        const questions: (Question & { sectionIndex: number; questionIndex: number; sectionName: string; sectionColor: string })[] = [];
        modelPaperData.sections.forEach((section, sIdx) => {
            section.questions.forEach((q, qIdx) => {
                questions.push({ ...q, sectionIndex: sIdx, questionIndex: qIdx, sectionName: section.name, sectionColor: section.color });
            });
        });
        return questions;
    };

    const handleOptionSelect = (questionId: number, optionLabel: string) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: optionLabel }));
    };

    const handleStepAnswer = (questionId: number, stepIndex: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                steps: { ...(prev[questionId]?.steps || {}), [stepIndex]: value },
                finalAnswer: prev[questionId]?.finalAnswer || ""
            }
        }));
    };

    const handleFinalAnswer = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                steps: prev[questionId]?.steps || {},
                finalAnswer: value
            }
        }));
    };

    const toggleGuidelines = (questionId: number) => {
        setShowGuidelines(prev => ({ ...prev, [questionId]: !prev[questionId] }));
        if (!showGuidelines[questionId]) {
            setShowSolution(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const toggleSolution = (questionId: number) => {
        setShowSolution(prev => ({ ...prev, [questionId]: !prev[questionId] }));
        if (!showSolution[questionId]) {
            setShowGuidelines(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const handleNext = () => {
        const section = modelPaperData.sections[currentSection];
        if (currentQuestion < section.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSection < modelPaperData.sections.length - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQuestion(0);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            setCurrentQuestion(modelPaperData.sections[currentSection - 1].questions.length - 1);
        }
    };

    const handleQuestionJump = (sectionIdx: number, questionIdx: number) => {
        setCurrentSection(sectionIdx);
        setCurrentQuestion(questionIdx);
    };

    const handleMarkForReview = () => {
        const questionId = getCurrentQuestion()?.id;
        if (!questionId) return;

        const newMarked = new Set(markedQuestions);
        newMarked.has(questionId) ? newMarked.delete(questionId) : newMarked.add(questionId);
        setMarkedQuestions(newMarked);
    };

    const handleSubmit = (auto = false) => {
        if (!isSubmitted) {
            const msg = auto ? "කාලය අවසන්! Time's up!" : "ඔබට විභාගය අවසන් කිරීමට අවශ්‍යද?";
            if (auto || window.confirm(msg)) {
                setIsSubmitted(true);
                if (timerRef.current) clearInterval(timerRef.current);
                const allSolutions: ToggleState = {};
                getAllQuestions().forEach(q => { allSolutions[q.id] = true; });
                setShowSolution(allSolutions);
            }
        }
    };

    const calculateScore = (): ScoreResult => {
        let correct = 0, total = 0, totalMarks = 0, obtainedMarks = 0;
        const sectionScores: { [sectionId: string]: SectionScore } = {};

        modelPaperData.sections.forEach(section => {
            let sc = 0, st = 0, sm = 0, so = 0;
            section.questions.forEach(q => {
                total++; st++; totalMarks += q.marks; sm += q.marks;
                const correctOpt = q.options.find(o => o.isCorrect);
                if (selectedOptions[q.id] === correctOpt?.label) {
                    correct++; sc++; obtainedMarks += q.marks; so += q.marks;
                }
            });
            sectionScores[section.id] = { correct: sc, total: st, marks: sm, obtained: so, percentage: sm > 0 ? (so / sm) * 100 : 0 };
        });

        return { correct, total, totalMarks, obtainedMarks, percentage: totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0, sectionScores };
    };

    const getQuestionStatus = (questionId: number) => {
        if (markedQuestions.has(questionId)) return 'marked';
        if (selectedOptions[questionId] || answers[questionId]?.finalAnswer) return 'answered';
        return 'unanswered';
    };

    const mathNotations = [
        { symbol: "+", label: "+" }, { symbol: "-", label: "-" }, { symbol: "×", label: "×" },
        { symbol: "÷", label: "÷" }, { symbol: "%", label: "%" }, { symbol: "=", label: "=" },
        { symbol: "රු.", label: "රු." }, { symbol: "(", label: "(" }, { symbol: ")", label: ")" }
    ];

    const insertNotation = (inputKey: string, notation: string) => {
        const input = inputRefs.current[inputKey];
        if (input) {
            const start = input.selectionStart || 0;
            const newValue = input.value.substring(0, start) + notation + input.value.substring(input.selectionEnd || 0);
            if (inputKey.startsWith('step-')) {
                const [, qId, sIdx] = inputKey.split('-');
                handleStepAnswer(parseInt(qId), parseInt(sIdx), newValue);
            } else if (inputKey.startsWith('final-')) {
                handleFinalAnswer(parseInt(inputKey.split('-')[1]), newValue);
            }
            setTimeout(() => { input.focus(); input.setSelectionRange(start + notation.length, start + notation.length); }, 0);
        }
    };

    const question = getCurrentQuestion();
    const allQuestions = getAllQuestions();

    // ==================== INSTRUCTIONS SCREEN ====================
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dominant-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">📝</div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{modelPaperData.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{modelPaperData.titleEnglish}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{modelPaperData.duration}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">විනාඩි / Minutes</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{modelPaperData.totalMarks}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">මුළු ලකුණු / Marks</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/40 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{allQuestions.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">ප්‍රශ්න / Questions</div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">📋 උපදෙස් / Instructions: </h3>
                        <ul className="space-y-2">
                            {modelPaperData.instructions.map((inst, idx) => (
                                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                    <span className="text-yellow-500 mr-2">•</span>{inst}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-dominant-700 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">📚 කොටස් / Sections:</h3>
                        <div className="space-y-2">
                            {modelPaperData.sections.map((section, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                                    <span>{section.icon} {section.name}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{section.questions.length} ප්‍රශ්න • {section.marks} ලකුණු</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-lg transition-all"
                    >
                        විභාගය ආරම්භ කරන්න / Start Exam 🚀
                    </button>
                </div>
            </div>
        );
    }

    // ==================== RESULTS SCREEN ====================
    if (isSubmitted) {
        const score = calculateScore();
        const getGrade = (pct: number) => {
            if (pct >= 75) return { grade: 'A', color: 'green', label: 'විශිෂ්ට / Excellent' };
            if (pct >= 65) return { grade: 'B', color: 'blue', label: 'ඉතා හොඳ / Very Good' };
            if (pct >= 55) return { grade: 'C', color: 'yellow', label: 'හොඳ / Good' };
            if (pct >= 35) return { grade: 'S', color: 'orange', label: 'සාමාන්‍ය / Satisfactory' };
            return { grade: 'F', color: 'red', label: 'අසමත් / Fail' };
        };
        const gradeInfo = getGrade(score.percentage);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dominant-900">
                <header className="bg-green-600 text-white shadow-md">
                    <div className="max-w-full mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">📋 {modelPaperData.title}</span>
                            <span className="text-lg font-bold">✅ විභාගය අවසන්</span>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Score Card */}
                    <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">🎯 ඔබේ ප්‍රතිඵල / Your Results</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score.correct}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">නිවැරදි / Correct</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-dominant-700 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-gray-600 dark:text-gray-200">{score.total}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">මුළු / Total</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{score.obtainedMarks}/{score.totalMarks}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">ලකුණු / Marks</div>
                            </div>
                            <div className={`rounded-lg p-4 text-center bg-${gradeInfo.color}-100 dark:bg-${gradeInfo.color}-900/20`}>
                                <div className={`text-3xl font-bold text-${gradeInfo.color}-600 dark:text-${gradeInfo.color}-400`}>{score.percentage.toFixed(1)}%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">ප්‍රතිශතය</div>
                            </div>
                        </div>

                        {/* Grade Display */}
                        <div className="text-center mb-6">
                            <div className={`inline-block text-6xl font-bold px-8 py-4 rounded-full bg-${gradeInfo.color}-500 text-white`}>
                                {gradeInfo.grade}
                            </div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{gradeInfo.label}</p>
                        </div>

                        {/* Section Breakdown */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">📊 කොටස් අනුව ප්‍රතිඵල / Section Breakdown: </h3>
                            <div className="space-y-2">
                                {modelPaperData.sections.map(section => {
                                    const ss = score.sectionScores[section.id];
                                    return (
                                        <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dominant-700 rounded-lg">
                                            <span className="text-gray-700 dark:text-gray-300">{section.icon} {section.name.split(' - ')[1]}</span>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{ss.correct}/{ss.total} ප්‍රශ්න</span>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{ss.obtained}/{ss.marks} ලකුණු</span>
                                                <span className={`px-2 py-1 rounded text-sm font-bold ${ss.percentage >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                    {ss.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4">
                            <button onClick={() => navigate('/quiz/generate')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                🏠 මුල් පිටුවට / Home
                            </button>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                                🔄 නැවත උත්සාහ කරන්න / Retry
                            </button>
                        </div>
                    </div>

                    {/* Detailed Answers */}
                    <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">📝 සවිස්තර පිළිතුරු / Detailed Answers</h3>
                        {modelPaperData.sections.map((section, sIdx) => (
                            <div key={sIdx} className="mb-6">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b dark:border-dominant-700">{section.icon} {section.name}</h4>
                                {section.questions.map((q) => {
                                    const userAns = selectedOptions[q.id];
                                    const correctOpt = q.options.find(o => o.isCorrect);
                                    const isCorrect = userAns === correctOpt?.label;

                                    return (
                                        <div key={q.id} className={`mb-4 p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">Q{q.id}: {q.question.substring(0, 100)}...</span>
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {isCorrect ? '✓ නිවැරදි' : '✗ වැරදි'}
                                                </span>
                                            </div>

                                            {/* ... More details if needed ... */}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ==================== MAIN QUIZ UI ====================
    if (!question) return <div>Loaing...</div>;

    const currentAnswer = answers[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dominant-900">
            {/* Header with Timer */}
            <header className="bg-blue-700 dark:bg-blue-900 text-white shadow-md sticky top-0 z-50">
                <div className="flex justify-between items-center px-4 h-16">
                    <div className="flex items-center space-x-4">
                        <div className="text-xl font-bold">{modelPaperData.title}</div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                            {formatTime(timeRemaining)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSubmitted(true)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-bold text-sm"
                        >
                            Finish Exam
                        </button>
                        <div className="relative language-dropdown-container">
                            <button
                                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                            >
                                🌐
                            </button>
                            {showLanguageDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dominant-800 rounded shadow-xl py-2 text-gray-800 dark:text-gray-200">
                                    <button onClick={() => changeLanguage('si')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dominant-700">Sinhala</button>
                                    <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dominant-700">English</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar - Navigation */}
                <aside className="w-80 bg-white dark:bg-dominant-800 border-r border-gray-200 dark:border-dominant-700 flex flex-col hidden lg:flex">
                    <div className="p-4 border-b border-gray-200 dark:border-dominant-700 bg-gray-50 dark:bg-dominant-900">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">Question Palette</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {modelPaperData.sections.map((section, sIdx) => (
                            <div key={section.id}>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                                    <span className="mr-2">{section.icon}</span> {section.name}
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {section.questions.map((q, qIdx) => {
                                        const status = getQuestionStatus(q.id);
                                        let btnClass = "bg-gray-100 dark:bg-dominant-700 text-gray-600 dark:text-gray-400";
                                        if (status === 'answered') btnClass = "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700";
                                        if (status === 'marked') btnClass = "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700";
                                        if (currentSection === sIdx && currentQuestion === qIdx) btnClass = "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => handleQuestionJump(sIdx, qIdx)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${btnClass}`}
                                            >
                                                {q.id}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-dominant-700 bg-gray-50 dark:bg-dominant-900">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center"><div className="w-3 h-3 bg-green-200 rounded mr-1"></div> Answered</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div> Marked</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 rounded mr-1"></div> Current</div>
                        </div>
                    </div>
                </aside>

                {/* Main Question Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Question Card */}
                        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md border border-gray-200 dark:border-dominant-700 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-dominant-700 p-4 border-b border-gray-200 dark:border-dominant-600 flex justify-between items-center">
                                <span className="font-bold text-gray-700 dark:text-gray-200">Question {question.id}</span>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-gray-200 dark:bg-dominant-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{question.marks} Marks</span>
                                    <span className={`text-xs px-2 py-1 rounded text-white ${question.difficulty === 'easy' ? 'bg-green-500' : question.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                        {question.difficulty.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-6 leading-relaxed">
                                    {question.question}
                                </h2>

                                {/* Options (if multiple choice) - assuming options exist for all in model paper */}
                                <div className="space-y-3 mb-8">
                                    {question.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(question.id, opt.label)}
                                            className={`w-full p-4 rounded-xl border-2 text-left flex items-center transition-all ${selectedOptions[question.id] === opt.label ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-dominant-600 hover:border-blue-300 dark:hover:border-blue-700'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 border-2 ${selectedOptions[question.id] === opt.label ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-500'}`}>
                                                {opt.label}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{opt.value}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Step Calculation input area could go here if we want hybrid input + MCQ */}
                                {/* For now keeping model paper as primarily MCQ based on data structure, but adding workspace */}

                                <div className="mb-6">
                                    <button
                                        onClick={() => toggleGuidelines(question.id)}
                                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                    >
                                        <span className="mr-1">{showGuidelines[question.id] ? '▼' : '▶'}</span>
                                        Show Guidelines / Hints
                                    </button>

                                    {showGuidelines[question.id] && (
                                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">{question.guidelines.title}</h4>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">{question.guidelines.concept}</p>
                                            <div className="text-sm bg-white dark:bg-dominant-800 p-3 rounded border border-yellow-100 dark:border-yellow-900/30">
                                                {question.guidelines.rules.map((rule, i) => (
                                                    <div key={i} className="mb-2 last:mb-0">
                                                        <div className="font-mono text-blue-600 dark:text-blue-400">{rule.formula}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{rule.rule}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Navigation */}
                            <div className="bg-gray-50 dark:bg-dominant-700 p-4 border-t border-gray-200 dark:border-dominant-600 flex justify-between">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentSection === 0 && currentQuestion === 0}
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-dominant-800 border border-gray-300 dark:border-dominant-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dominant-600 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={handleMarkForReview}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${markedQuestions.has(question.id) ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {markedQuestions.has(question.id) ? 'Marked for Review' : 'Mark for Review'}
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                                >
                                    Next Question
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ModelPaperTaking;
