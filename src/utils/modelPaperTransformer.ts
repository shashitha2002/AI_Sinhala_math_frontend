import type {
    ShortAnswerQuestion,
    StructuredQuestion,
    EssayQuestion
} from '../services/modelPaperService';

// Frontend format interfaces
interface Option {
    label: string;
    value: string;
    isCorrect: boolean;
}

interface Step {
    stepNumber: number;
    description: string;
    calculation: string;
    working: string;
    answer: string;
}

interface Solution {
    steps: Step[];
    finalAnswer: string;
}

interface Rule {
    rule: string;
    ruleEnglish: string;
    formula: string;
}

interface Guidelines {
    title: string;
    titleEnglish: string;
    concept: string;
    rules: Rule[];
    tips: string[];
}

interface Question {
    id: number;
    question: string;
    marks: number;
    difficulty: 'easy' | 'medium' | 'hard';
    guidelines: Guidelines;
    solution: Solution;
    options: Option[];
}

interface Section {
    id: string;
    name: string;
    nameEnglish: string;
    icon: string;
    color: string;
    marks: number;
    questions: Question[];
}

interface ModelPaperData {
    title: string;
    titleEnglish: string;
    duration: number;
    totalMarks: number;
    instructions: string[];
    sections: Section[];
}

/**
 * Transform backend-generated questions to frontend format
 */
export const transformGeneratedPaper = (generatedPaper: {
    short_answer?: ShortAnswerQuestion[];
    structured?: StructuredQuestion[];
    essay_type?: EssayQuestion[];
}): ModelPaperData => {
    const sections: Section[] = [];
    let questionIdCounter = 1;

    // Transform Short Answer Questions
    if (generatedPaper.short_answer && generatedPaper.short_answer.length > 0) {
        const questions: Question[] = generatedPaper.short_answer.map(q => {
            const steps: Step[] = q.answer_steps.map((step, idx) => ({
                stepNumber: idx + 1,
                description: step.description,
                calculation: step.description,
                working: step.value,
                answer: step.value
            }));

            return {
                id: questionIdCounter++,
                question: q.question,
                options: generateDummyOptions(q.final_answer || q.answer_steps[q.answer_steps.length - 1]?.value || ''),
                marks: 2,
                difficulty: 'medium' as const,
                solution: {
                    steps,
                    finalAnswer: q.final_answer || q.answer_steps[q.answer_steps.length - 1]?.value || ''
                },
                guidelines: {
                    title: 'සංකල්ප මාර්ගෝපදේශ',
                    titleEnglish: 'Concept Guidelines',
                    concept: q.topics.join(', '),
                    rules: q.answer_steps.map(step => ({
                        rule: step.description,
                        ruleEnglish: step.description,
                        formula: step.value
                    })),
                    tips: ['විසඳුම සඳහා පියවර අනුගමනය කරන්න', 'Follow the steps for solution']
                }
            };
        });

        sections.push({
            id: 'section-a',
            name: 'කොටස A - Short Answer Questions',
            nameEnglish: 'Section A - Short Answer Questions',
            icon: '📝',
            color: 'blue',
            marks: questions.length * 2,
            questions
        });
    }

    // Transform Structured Questions
    if (generatedPaper.structured && generatedPaper.structured.length > 0) {
        const questions: Question[] = generatedPaper.structured.map(q => {
            // Combine all sub-questions into main question text
            const fullQuestion = q.question + '\n' +
                q.sub_questions.map(sq => `${sq.sub_question_label} ${sq.sub_question}`).join('\n');

            const allSteps: Step[] = [];
            let stepNum = 1;

            q.sub_questions.forEach(sq => {
                sq.answer_steps.forEach(step => {
                    allSteps.push({
                        stepNumber: stepNum++,
                        description: step.description,
                        calculation: step.description,
                        working: step.value,
                        answer: step.value
                    });
                });
            });

            const finalAnswer = q.sub_questions[q.sub_questions.length - 1]?.answer || '';

            return {
                id: questionIdCounter++,
                question: fullQuestion,
                options: generateDummyOptions(finalAnswer),
                marks: 5,
                difficulty: 'medium' as const,
                topics: q.topics,
                solution: {
                    steps: allSteps,
                    finalAnswer
                },
                guidelines: {
                    title: 'ව්‍යුහගත ප්‍රශ්න මාර්ගෝපදේශ',
                    titleEnglish: 'Structured Question Guidelines',
                    concept: q.topics.join(', '),
                    rules: allSteps.map(step => ({
                        rule: step.calculation,
                        ruleEnglish: step.calculation,
                        formula: step.working
                    })),
                    tips: ['එක් එක් උප-ප්‍රශ්නය අනුපිළිවෙලට විසඳන්න', 'Solve each sub-question in order']
                }
            };
        });

        sections.push({
            id: 'section-b',
            name: 'කොටස B - Structured Questions',
            nameEnglish: 'Section B - Structured Questions',
            icon: '📊',
            color: 'green',
            marks: questions.length * 5,
            questions
        });
    }

    // Transform Essay Questions
    if (generatedPaper.essay_type && generatedPaper.essay_type.length > 0) {
        const questions: Question[] = generatedPaper.essay_type.map(q => {
            const fullQuestion = q.question + '\n' +
                q.sub_questions.map(sq => `${sq.sub_question_label} ${sq.sub_question}`).join('\n');

            const allSteps: Step[] = [];
            let stepNum = 1;

            q.sub_questions.forEach(sq => {
                sq.answer_steps.forEach(step => {
                    allSteps.push({
                        stepNumber: stepNum++,
                        description: step.description,
                        calculation: step.description,
                        working: step.value,
                        answer: step.value
                    });
                });
            });

            const finalAnswer = q.sub_questions[q.sub_questions.length - 1]?.answer || '';

            return {
                id: questionIdCounter++,
                question: fullQuestion,
                options: generateDummyOptions(finalAnswer),
                marks: 10,
                difficulty: 'hard' as const,
                topics: q.topics,
                solution: {
                    steps: allSteps,
                    finalAnswer
                },
                guidelines: {
                    title: 'රචනා ප්‍රශ්න මාර්ගෝපදේශ',
                    titleEnglish: 'Essay Question Guidelines',
                    concept: q.topics.join(', '),
                    rules: allSteps.map(step => ({
                        rule: step.calculation,
                        ruleEnglish: step.calculation,
                        formula: step.working
                    })),
                    tips: ['සන්දර්භය හොඳින් කියවා ප්‍රශ්න විසඳන්න', 'Read the scenario carefully before solving']
                }
            };
        });

        sections.push({
            id: 'section-c',
            name: 'කොටස C - Essay Type Questions',
            nameEnglish: 'Section C - Essay Type Questions',
            icon: '✍️',
            color: 'purple',
            marks: questions.length * 10,
            questions
        });
    }

    const totalMarks = sections.reduce((sum, section) => sum + section.marks, 0);
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

    return {
        title: 'AI ජනනය කළ ආදර්ශ ප්‍රශ්න පත්‍රය',
        titleEnglish: 'AI Generated Model Paper',
        duration: 180, // 3 hours
        totalMarks,
        instructions: [
            `මෙම ප්‍රශ්න පත්‍රයේ ප්‍රශ්න ${totalQuestions}ක් ඇත.`,
            `සියලුම ප්‍රශ්න වලට පිළිතුරු සපයන්න.`,
            `මුළු ලකුණු ${totalMarks} කි.`,
            'කාලය විනාඩි 180 කි.'
        ],
        sections
    };
};

/**
 * Generate dummy MCQ options from an answer
 * This creates plausible distractors for the quiz UI
 */
function generateDummyOptions(correctAnswer: string): Option[] {
    return [
        { label: 'අ', value: correctAnswer, isCorrect: true },
        { label: 'ආ', value: 'විකල්ප පිළිතුර 1', isCorrect: false },
        { label: 'ඇ', value: 'විකල්ප පිළිතුර 2', isCorrect: false },
        { label: 'ඈ', value: 'විකල්ප පිළිතුර 3', isCorrect: false }
    ];
}
