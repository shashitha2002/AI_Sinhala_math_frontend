/**
 * Topic-specific mathematical notation buttons
 * Each topic gets its own set of symbols students commonly need
 */

export interface NotationButton {
    symbol: string;
    label: string;
    tooltip?: string;
}

// Common notations available for ALL topics
const commonNotations: NotationButton[] = [
    { symbol: '+', label: '+' },
    { symbol: '-', label: '-' },
    { symbol: '×', label: '×' },
    { symbol: '÷', label: '÷' },
    { symbol: '=', label: '=' },
    { symbol: '(', label: '(' },
    { symbol: ')', label: ')' },
    { symbol: ',', label: ',' },
    { symbol: '.', label: '.' },
];

// Topic-specific notations
const topicNotations: Record<string, NotationButton[]> = {
    // Interest / පොළිය
    'පොළිය': [
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '%', label: '%' },
        { symbol: '/', label: '/' },
    ],
    'පොලිය': [
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '%', label: '%' },
        { symbol: '/', label: '/' },
    ],

    // Equations / සමීකරණ
    'සමීකරණ': [
        { symbol: 'x', label: 'x' },
        { symbol: 'y', label: 'y' },
        { symbol: '²', label: '²', tooltip: 'x²' },
        { symbol: '³', label: '³', tooltip: 'x³' },
        { symbol: '√', label: '√' },
        { symbol: '±', label: '±' },
        { symbol: '≠', label: '≠' },
    ],
    'සමගාමී සමීකරණ': [
        { symbol: 'x', label: 'x' },
        { symbol: 'y', label: 'y' },
        { symbol: '²', label: '²' },
        { symbol: '³', label: '³' },
        { symbol: '√', label: '√' },
        { symbol: '±', label: '±' },
    ],

    // Stock Market / කොටස් වෙළෙඳපොළ
    'කොටස් වෙළෙඳපොළ': [
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '%', label: '%' },
        { symbol: '/', label: '/' },
    ],
    'කොටස් වෙළඳපොළ': [
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '%', label: '%' },
        { symbol: '/', label: '/' },
    ],

    // Logarithms / ලඝුගණක
    'ලඝුගණක': [
        { symbol: 'log', label: 'log' },
        { symbol: 'lg', label: 'lg' },
        { symbol: '¹⁰', label: '10^' },
        { symbol: '²', label: '²' },
        { symbol: '³', label: '³' },
        { symbol: '√', label: '√' },
        { symbol: '∛', label: '∛' },
        { symbol: '⁻', label: '⁻', tooltip: 'negative exponent' },
    ],

    // Speed / ශ්‍රීඝ්‍රතාවය
    'ශ්‍රීඝ්‍රතාවය': [
        { symbol: 'km/h', label: 'km/h' },
        { symbol: 'm/s', label: 'm/s' },
        { symbol: 'km', label: 'km' },
        { symbol: 'm', label: 'm' },
        { symbol: '/', label: '/' },
    ],

    // Arithmetic Progressions / සමාන්තර ශ්‍රේණි
    'සමාන්තර ශ්‍රේණි': [
        { symbol: 'a', label: 'a', tooltip: 'first term' },
        { symbol: 'd', label: 'd', tooltip: 'common difference' },
        { symbol: 'n', label: 'n' },
        { symbol: 'Tₙ', label: 'Tₙ' },
        { symbol: 'Sₙ', label: 'Sₙ' },
        { symbol: '²', label: '²' },
    ],

    // Geometric Progressions
    'ගුණෝත්තර ශ්‍රේණි': [
        { symbol: 'a', label: 'a' },
        { symbol: 'r', label: 'r' },
        { symbol: 'n', label: 'n' },
        { symbol: '²', label: '²' },
        { symbol: '³', label: '³' },
        { symbol: '⁴', label: '⁴' },
    ],

    // Percentages
    'ප්‍රතිශත': [
        { symbol: '%', label: '%' },
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '/', label: '/' },
    ],

    // Probability
    'සම්භාවිතාව': [
        { symbol: '/', label: '/' },
        { symbol: 'P', label: 'P' },
        { symbol: "'", label: "'" },
    ],

    // Taxes
    'බදු': [
        { symbol: 'රු.', label: 'රු.' },
        { symbol: '%', label: '%' },
        { symbol: '/', label: '/' },
    ],

    // Volume / Surface Area
    'ඝන වස්තුවල පරිමාව': [
        { symbol: 'π', label: 'π' },
        { symbol: '²', label: '²' },
        { symbol: '³', label: '³' },
        { symbol: '√', label: '√' },
        { symbol: 'cm', label: 'cm' },
        { symbol: 'm', label: 'm' },
    ],
    'ඝන වස්තුවල පරිමාව සහ පෘෂ්ඨ වර්ගඵලය': [
        { symbol: 'π', label: 'π' },
        { symbol: '²', label: '²' },
        { symbol: '³', label: '³' },
        { symbol: '√', label: '√' },
        { symbol: 'cm', label: 'cm' },
        { symbol: 'm', label: 'm' },
    ],
};

/**
 * Get notation buttons for a given set of topics.
 * Merges common + all topic-specific notations, deduplicating.
 */
export function getNotationsForTopics(topics: string[]): NotationButton[] {
    const seen = new Set<string>();
    const result: NotationButton[] = [];

    // Add common first
    for (const n of commonNotations) {
        if (!seen.has(n.symbol)) {
            seen.add(n.symbol);
            result.push(n);
        }
    }

    // Add topic-specific
    for (const topic of topics) {
        const specific = topicNotations[topic];
        if (specific) {
            for (const n of specific) {
                if (!seen.has(n.symbol)) {
                    seen.add(n.symbol);
                    result.push(n);
                }
            }
        }
    }

    return result;
}

/**
 * Get a combined notation set for a model paper (all topics)
 */
export function getModelPaperNotations(topicsUsed: string[]): NotationButton[] {
    // For a model paper, provide a comprehensive set
    const allTopics = new Set(topicsUsed);
    return getNotationsForTopics(Array.from(allTopics));
}

// For the lesson-wise quiz: single topic
export function getNotationsForTopic(topic: string): NotationButton[] {
    return getNotationsForTopics([topic]);
}