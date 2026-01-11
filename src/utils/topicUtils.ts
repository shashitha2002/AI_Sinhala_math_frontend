/**
 * Maps backend topic names to translation keys.
 * This is used to ensure consistent keys across the application for i18n.
 * 
 * @param {string} topicName - The English topic name from the backend
 * @returns {string} The translation key
 */
export const getTopicKey = (topicName: string): string => {
    if (!topicName) return '';

    // Remove special characters and extra spaces, convert to camelCase
    // Special handling for Roman numerals to avoid "i" vs "I" issues if any
    const normalized = topicName.trim();

    const map: Record<string, string> = {
        'Perimeter': 'perimeter',
        'Square Root': 'squareRoot',
        'Fractions': 'fractions',
        'Binomial Expressions': 'binomialExpressions',
        'Proportion': 'proportion',
        'Square Area': 'squareArea',
        'Factorization of Quadratic Expressions': 'factorizationQuadratic',
        'Triangles': 'triangles',
        'Inverse Proportion': 'inverseProportion',
        'Data Representation': 'dataRepresentation',
        'LCM of Algebraic Expressions': 'lcmAlgebraic',
        'Algebraic Fractions': 'algebraicFractions',
        'Percentages': 'percentages',
        'Equations': 'equations',
        'Arithmetic Sequences I': 'arithmeticSequences1',
        'Arithmetic Sequences II': 'arithmeticSequences2',
        'Sets': 'sets',
        'Logarithms I': 'logarithms1',
        'Logarithms II': 'logarithms2',
        'Graphs': 'graphs',
        'Speed': 'speed',
        'Formulae': 'formulae',
        'Arithmetic Progressions': 'arithmeticProgressions',
        'Algebraic Inequalities': 'algebraicInequalities',
        'Frequency Distribution': 'frequencyDistribution',
        'Circle Area': 'circleArea',
        'Construction': 'construction',
        'Surface Area and Volume': 'surfaceAreaVolume',
        'Probability': 'probability',
        'Circle Angles': 'circleAngles',
        'Scale Drawings': 'scaleDrawings',
        'Real Numbers': 'realNumbers',
        'Indices and Logarithms I': 'indicesLogarithms1',
        'Indices and Logarithms II': 'indicesLogarithms2',
        'Surface Area of Solids': 'surfaceAreaSolids',
        'Volume of Solids': 'volumeSolids',
        'Area of Plane Figures between Parallel Lines': 'areaParallelLines',
        'Stock Market': 'stockMarket',
        'Midpoint Theorem': 'midpointTheorem',
        'Isosceles Triangles': 'isoscelesTriangles',
        'Data Representation and Interpretation': 'dataRepresentationInterpretation',
        'Geometric Progressions': 'geometricProgressions',
        'Pythagorean Theorem': 'pythagoreanTheorem',
        'Trigonometry': 'trigonometry',
        'Matrices': 'matrices',
        'Inequalities': 'inequalities',
        'Cyclic Quadrilaterals': 'cyclicQuadrilaterals',
        'Tangents': 'tangents'
    };

    return map[normalized] || normalized; // Fallback to original if not found
};
