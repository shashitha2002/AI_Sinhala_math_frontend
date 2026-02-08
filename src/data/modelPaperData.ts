
export interface Option {
    label: string;
    value: string;
    isCorrect: boolean;
}

export interface Step {
    stepNumber: number;
    description: string;
    calculation: string;
    working: string;
    answer: string;
}

export interface Solution {
    steps: Step[];
    finalAnswer: string;
}

export interface Rule {
    rule: string;
    ruleEnglish: string;
    formula: string;
}

export interface Guidelines {
    title: string;
    titleEnglish: string;
    concept: string;
    rules: Rule[];
    tips: string[];
}

export interface Question {
    id: number;
    question: string;
    marks: number;
    difficulty: "easy" | "medium" | "hard";
    guidelines: Guidelines;
    solution: Solution;
    options: Option[];
}

export interface Section {
    id: string;
    name: string;
    nameEnglish: string;
    marks: number;
    icon: string;
    color: string;
    questions: Question[];
}

export interface ModelPaperData {
    title: string;
    titleEnglish: string;
    duration: number;
    totalMarks: number;
    year: number;
    instructions: string[];
    sections: Section[];
}

export const MODEL_PAPER_DATA: ModelPaperData = {
    title: "සාමාන්‍ය පෙළ ගණිතය - ආදර්ශ ප්‍රශ්න පත්‍රය 2024",
    titleEnglish: "O/L Mathematics - Model Paper 2024",
    duration: 180,
    totalMarks: 100,
    year: 2024,
    instructions: [
        "සියලුම ප්‍රශ්නවලට පිළිතුරු සපයන්න / Answer all questions",
        "සෑම පියවරක්ම පැහැදිලිව ලියන්න / Show all working steps",
        "අවසාන පිළිතුරු වලට ඒකක ඇතුළත් කරන්න / Include units in final answers",
        "කැල්කියුලේටර භාවිතය තහනම් / Calculator not allowed"
    ],
    sections: [
        // SECTION 1: INSTALLMENTS
        {
            id: "installments",
            name: "කොටස I - වාරික ගණනය",
            nameEnglish: "Section I - Installments",
            marks: 20,
            icon: "💰",
            color: "blue",
            questions: [
                {
                    id: 1,
                    question: "රු. 120,000 වටිනා ශීතකරණයක් මසකට රු. 11,000 බැගින් වාරික 12 කින් ගෙවීමට තීරණය කළේය.  මුළු ගෙවන මුදල, පොලිය සහ පොලී අනුපාතය ගණනය කරන්න.",
                    marks: 10,
                    difficulty: "medium",
                    guidelines: {
                        title: "වාරික ගණනය - මූලික සූත්‍ර",
                        titleEnglish: "Installment Calculations - Basic Formulas",
                        concept: "වාරික ක්‍රමයට භාණ්ඩ මිල දී ගැනීමේදී මුල් මිලට වඩා වැඩි මුදලක් ගෙවීමට සිදු වේ.",
                        rules: [
                            { rule: "මුළු ගෙවන මුදල = මාසික වාරිකය × වාරික ගණන", ruleEnglish: "Total Payment = Monthly Installment × Number of Installments", formula: "T = I × n" },
                            { rule: "පොලිය = මුළු ගෙවන මුදල - මුල් මිල", ruleEnglish: "Interest = Total Payment - Cash Price", formula: "Interest = T - P" },
                            { rule: "පොලී අනුපාතය = (පොලිය / මුල් මිල) × 100%", ruleEnglish: "Interest Rate = (Interest / Cash Price) × 100%", formula: "R = (I/P) × 100%" }
                        ],
                        tips: ["පළමුව මුළු ගෙවන මුදල ගණනය කරන්න", "පොලිය ගණනය කිරීමට මුල් මිල අඩු කරන්න", "ඒකක (රු., %) නිවැරදිව ලියන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "මුළු ගෙවන මුදල ගණනය කිරීම", calculation: "මුළු ගෙවන මුදල = මාසික වාරිකය × වාරික ගණන", working: "= රු. 11,000 × 12", answer: "= රු. 132,000" },
                            { stepNumber: 2, description: "පොලිය ගණනය කිරීම", calculation: "පොලිය = මුළු ගෙවන මුදල - මුල් මිල", working: "= රු. 132,000 - රු. 120,000", answer: "= රු. 12,000" },
                            { stepNumber: 3, description: "පොලී අනුපාතය ගණනය කිරීම", calculation: "පොලී අනුපාතය = (පොලිය / මුල් මිල) × 100%", working: "= (රු. 12,000 / රු. 120,000) × 100%", answer: "= 10%" }
                        ],
                        finalAnswer: "මුළු ගෙවන මුදල = රු. 132,000, පොලිය = රු. 12,000, පොලී අනුපාතය = 10%"
                    },
                    options: [
                        { label: "A", value: "මුළු මුදල = රු. 132,000, පොලිය = රු. 12,000, අනුපාතය = 10%", isCorrect: true },
                        { label: "B", value: "මුළු මුදල = රු. 130,000, පොලිය = රු. 10,000, අනුපාතය = 8%", isCorrect: false },
                        { label: "C", value: "මුළු මුදල = රු. 132,000, පොලිය = රු. 12,000, අනුපාතය = 12%", isCorrect: false },
                        { label: "D", value: "මුළු මුදල = රු. 134,000, පොලිය = රු.  14,000, අනුපාතය = 10%", isCorrect: false }
                    ]
                },
                {
                    id: 2,
                    question: "රු. 200,000 වටිනා මෝටර් සයිකලයක් සඳහා රු. 50,000 ක් මුලින් ගෙවා ඉතිරිය මාස 20 කින් වාරික ලෙස ගෙවනු ලැබේ. මුළු පොලිය රු. 18,000 නම් මාසික වාරිකය කොපමණද?",
                    marks: 10,
                    difficulty: "hard",
                    guidelines: {
                        title: "මූලික ගෙවීම් සහිත වාරික ගණනය",
                        titleEnglish: "Installments with Down Payment",
                        concept: "මූලික ගෙවීමක් ඇති විට, පොලිය ගණනය කරන්නේ ඉතිරි ණය මුදල මත පමණි.",
                        rules: [
                            { rule: "ණය මුදල = මුළු මිල - මූලික ගෙවීම", ruleEnglish: "Loan Amount = Total Price - Down Payment", formula: "L = P - D" },
                            { rule: "මුළු වාරික ගෙවීම = ණය මුදල + පොලිය", ruleEnglish: "Total Installment = Loan + Interest", formula: "T = L + I" },
                            { rule: "මාසික වාරිකය = මුළු වාරික ගෙවීම / වාරික ගණන", ruleEnglish: "Monthly Installment = Total / Number of months", formula: "M = T / n" }
                        ],
                        tips: ["මූලික ගෙවීම අඩු කර ණය මුදල සොයන්න", "පොලිය එකතු කර මුළු වාරික ගෙවීම සොයන්න", "මාස ගණනින් බෙදන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "ණය මුදල ගණනය කිරීම", calculation: "ණය මුදල = මුළු මිල - මූලික ගෙවීම", working: "= රු. 200,000 - රු. 50,000", answer: "= රු. 150,000" },
                            { stepNumber: 2, description: "මුළු වාරික ගෙවීම ගණනය කිරීම", calculation: "මුළු වාරික ගෙවීම = ණය මුදල + පොලිය", working: "= රු. 150,000 + රු. 18,000", answer: "= රු. 168,000" },
                            { stepNumber: 3, description: "මාසික වාරිකය ගණනය කිරීම", calculation: "මාසික වාරිකය = මුළු වාරික ගෙවීම / වාරික ගණන", working: "= රු. 168,000 / 20", answer: "= රු. 8,400" }
                        ],
                        finalAnswer: "මාසික වාරිකය = රු. 8,400"
                    },
                    options: [
                        { label: "A", value: "රු. 8,400", isCorrect: true },
                        { label: "B", value: "රු. 8,000", isCorrect: false },
                        { label: "C", value: "රු. 9,000", isCorrect: false },
                        { label: "D", value: "රු. 7,500", isCorrect: false }
                    ]
                }
            ]
        },

        // SECTION 2: SIMPLE INTEREST
        {
            id: "simple-interest",
            name: "කොටස II - සරල පොලිය",
            nameEnglish: "Section II - Simple Interest",
            marks: 20,
            icon: "🏦",
            color: "green",
            questions: [
                {
                    id: 3,
                    question: "රු. 75,000 ක මුදලක් වාර්ෂික 8% සරල පොලී අනුපාතයකට වසර 4 ක් සඳහා බැංකුවක තැන්පත් කළේය. පොලිය සහ මුළු මුදල ගණනය කරන්න.",
                    marks: 10,
                    difficulty: "easy",
                    guidelines: {
                        title: "සරල පොලිය - මූලික සූත්‍රය",
                        titleEnglish: "Simple Interest - Basic Formula",
                        concept: "සරල පොලිය යනු මූලධනය මත පමණක් ගණනය කරන පොලියයි.",
                        rules: [
                            { rule: "සරල පොලිය (I) = (මූලධනය × අනුපාතය × කාලය) / 100", ruleEnglish: "Simple Interest (I) = (P × R × T) / 100", formula: "I = PRT/100" },
                            { rule: "මුළු මුදල (A) = මූලධනය + පොලිය", ruleEnglish: "Amount (A) = Principal + Interest", formula: "A = P + I" }
                        ],
                        tips: ["කාලය වසර වලින් තිබිය යුතුය", "මාස දී ඇත්නම් 12 න් බෙදන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "දත්ත හඳුනා ගැනීම", calculation: "P = රු. 75,000, R = 8%, T = 4 වසර", working: "", answer: "" },
                            { stepNumber: 2, description: "සරල පොලිය ගණනය කිරීම", calculation: "I = (P × R × T) / 100", working: "= (රු. 75,000 × 8 × 4) / 100", answer: "= රු. 24,000" },
                            { stepNumber: 3, description: "මුළු මුදල ගණනය කිරීම", calculation: "A = P + I", working: "= රු. 75,000 + රු. 24,000", answer: "= රු. 99,000" }
                        ],
                        finalAnswer: "පොලිය = රු. 24,000, මුළු මුදල = රු. 99,000"
                    },
                    options: [
                        { label: "A", value: "පොලිය = රු. 24,000, මුළු මුදල = රු. 99,000", isCorrect: true },
                        { label: "B", value: "පොලිය = රු. 20,000, මුළු මුදල = රු. 95,000", isCorrect: false },
                        { label: "C", value: "පොලිය = රු. 28,000, මුළු මුදල = රු. 103,000", isCorrect: false },
                        { label: "D", value: "පොලිය = රු. 22,000, මුළු මුදල = රු. 97,000", isCorrect: false }
                    ]
                },
                {
                    id: 4,
                    question: "යම් මුදලක් වාර්ෂික 10% සරල පොලී අනුපාතයකට වසර 3 කින් රු. 91,000 දක්වා වැඩි විය. මූලධනය සොයන්න.",
                    marks: 10,
                    difficulty: "medium",
                    guidelines: {
                        title: "මූලධනය සෙවීම",
                        titleEnglish: "Finding Principal from Amount",
                        concept: "මුළු මුදල දන්නා විට, සූත්‍රය ප්‍රතිසංවිධානය කර මූලධනය සොයා ගත හැක.",
                        rules: [
                            { rule: "A = P(1 + RT/100) සූත්‍රයෙන්", ruleEnglish: "From A = P(1 + RT/100)", formula: "P = A / (1 + RT/100)" }
                        ],
                        tips: ["පළමුව (1 + RT/100) ගණනය කරන්න", "A එම අගයෙන් බෙදන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "දත්ත හඳුනා ගැනීම", calculation: "A = රු. 91,000, R = 10%, T = 3 වසර", working: "", answer: "" },
                            { stepNumber: 2, description: "සූත්‍රය යෙදීම", calculation: "A = P(1 + RT/100)", working: "91,000 = P(1 + 10×3/100) = P(1.3)", answer: "" },
                            { stepNumber: 3, description: "P සඳහා විසඳීම", calculation: "P = A / 1.3", working: "= රු. 91,000 / 1.3", answer: "= රු. 70,000" }
                        ],
                        finalAnswer: "මූලධනය = රු. 70,000"
                    },
                    options: [
                        { label: "A", value: "රු. 70,000", isCorrect: true },
                        { label: "B", value: "රු. 65,000", isCorrect: false },
                        { label: "C", value: "රු. 75,000", isCorrect: false },
                        { label: "D", value: "රු. 72,000", isCorrect: false }
                    ]
                }
            ]
        },

        // SECTION 3: RATIOS
        {
            id: "ratios",
            name: "කොටස III - අනුපාත",
            nameEnglish: "Section III - Ratios",
            marks: 20,
            icon: "⚖️",
            color: "purple",
            questions: [
                {
                    id: 5,
                    question: "A සහ B අතර මුදල් බෙදා ගත්තේ 3:5 අනුපාතයෙනි. B ට A ට වඩා රු. 4,000 ක් වැඩි නම්, A ට ලැබුණු මුදල කොපමණද?",
                    marks: 10,
                    difficulty: "medium",
                    guidelines: {
                        title: "අනුපාත - වෙනස භාවිතා කර ගණනය",
                        titleEnglish: "Ratios - Using Difference",
                        concept: "අනුපාතවල වෙනස සහ සැබෑ වෙනස දන්නා විට, එක් කොටසක අගය සොයාගත හැක.",
                        rules: [
                            { rule: "අනුපාත වෙනස = B කොටස් - A කොටස්", ruleEnglish: "Ratio Difference = B parts - A parts", formula: "වෙනස = 5 - 3 = 2 කොටස්" },
                            { rule: "එක් කොටසක අගය = සැබෑ වෙනස / අනුපාත වෙනස", ruleEnglish: "Value of one part = Actual difference / Ratio difference", formula: "1 කොටස = 4,000 / 2" },
                            { rule: "A ගේ මුදල = A කොටස් × එක් කොටසක අගය", ruleEnglish: "A's amount = A's parts × Value per part", formula: "A = 3 × රු. 2,000" }
                        ],
                        tips: ["අනුපාතවල වෙනස ගණනය කරන්න", "එක් කොටසක අගය සොයන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "අනුපාත වෙනස ගණනය කිරීම", calculation: "B කොටස් - A කොටස්", working: "= 5 - 3", answer: "= 2 කොටස්" },
                            { stepNumber: 2, description: "එක් කොටසක අගය සෙවීම", calculation: "2 කොටස් = රු. 4,000", working: "1 කොටසක් = රු. 4,000 / 2", answer: "= රු. 2,000" },
                            { stepNumber: 3, description: "A ගේ මුදල ගණනය කිරීම", calculation: "A = 3 කොටස් × රු. 2,000", working: "= 3 × රු. 2,000", answer: "= රු. 6,000" }
                        ],
                        finalAnswer: "A ට ලැබුණු මුදල = රු. 6,000"
                    },
                    options: [
                        { label: "A", value: "රු. 6,000", isCorrect: true },
                        { label: "B", value: "රු. 8,000", isCorrect: false },
                        { label: "C", value: "රු. 5,000", isCorrect: false },
                        { label: "D", value: "රු. 10,000", isCorrect: false }
                    ]
                },
                {
                    id: 6,
                    question: "තුන් දෙනෙකු අතර මුදලක් 2:3:5 අනුපාතයෙන් බෙදා ගත්හ. මුළු මුදල රු. 50,000 නම්, එක් එක් අයට ලැබුණු මුදල් සොයන්න.",
                    marks: 10,
                    difficulty: "medium",
                    guidelines: {
                        title: "අනුපාත - මුළු එක භාවිතා කර බෙදීම",
                        titleEnglish: "Ratios - Division Using Total",
                        concept: "මුළු මුදල සහ අනුපාතය දන්නා විට, මුළු කොටස් ගණන මගින් බෙදා එක් කොටසක අගය සොයාගත හැක.",
                        rules: [
                            { rule: "මුළු කොටස් = සියලු අනුපාත එකතුව", ruleEnglish: "Total parts = Sum of all ratios", formula: "මුළු කොටස් = 2 + 3 + 5 = 10" },
                            { rule: "එක් කොටසක අගය = මුළු මුදල / මුළු කොටස්", ruleEnglish: "Value per part = Total / Total parts", formula: "1 කොටස = 50,000 / 10" }
                        ],
                        tips: ["පළමුව මුළු කොටස් ගණනය කරන්න", "සියලු මුදල් එකතු කර පරීක්ෂා කරන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "මුළු කොටස් ගණනය කිරීම", calculation: "මුළු කොටස් = 2 + 3 + 5", working: "", answer: "= 10 කොටස්" },
                            { stepNumber: 2, description: "එක් කොටසක අගය සෙවීම", calculation: "1 කොටසක් = මුළු මුදල / මුළු කොටස්", working: "= රු. 50,000 / 10", answer: "= රු. 5,000" },
                            { stepNumber: 3, description: "එක් එක් අයට ලැබුණු මුදල", calculation: "පළමු අය = 2 × රු. 5,000 = රු. 10,000", working: "දෙවන අය = 3 × රු. 5,000 = රු. 15,000", answer: "තුන්වන අය = 5 × රු. 5,000 = රු. 25,000" }
                        ],
                        finalAnswer: "පළමු අය = රු. 10,000, දෙවන අය = රු. 15,000, තුන්වන අය = රු. 25,000"
                    },
                    options: [
                        { label: "A", value: "රු. 10,000, රු. 15,000, රු. 25,000", isCorrect: true },
                        { label: "B", value: "රු. 15,000, රු. 15,000, රු. 20,000", isCorrect: false },
                        { label: "C", value: "රු. 8,000, රු. 12,000, රු. 30,000", isCorrect: false },
                        { label: "D", value: "රු. 12,000, රු. 18,000, රු. 20,000", isCorrect: false }
                    ]
                }
            ]
        },

        // SECTION 4: EQUATIONS
        {
            id: "equations",
            name: "කොටස IV - සමීකරණ",
            nameEnglish: "Section IV - Equations",
            marks: 20,
            icon: "🔢",
            color: "orange",
            questions: [
                {
                    id: 7,
                    question: "3x + 7 = 22 සමීකරණය විසඳා x හි අගය සොයන්න.",
                    marks: 5,
                    difficulty: "easy",
                    guidelines: {
                        title: "එක් විචල්‍යයක සරල සමීකරණ",
                        titleEnglish: "Simple Linear Equations",
                        concept: "සමීකරණයක් විසඳීමේදී, විචල්‍යය එක් පැත්තකට සහ නියතයන් අනෙක් පැත්තට ගෙන යන්න.",
                        rules: [
                            { rule: "සමීකරණයේ දෙපැත්තටම සමාන මෙහෙයුම් කළ හැක", ruleEnglish: "Same operations can be applied to both sides", formula: "ax + b = c ⟹ x = (c-b)/a" }
                        ],
                        tips: ["නියත පද පළමුව අනෙක් පැත්තට ගෙන යන්න", "x හි සංගුණකයෙන් බෙදන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "නියත පදය අනෙක් පැත්තට ගෙනයාම", calculation: "3x + 7 = 22", working: "3x = 22 - 7", answer: "3x = 15" },
                            { stepNumber: 2, description: "x සඳහා විසඳීම", calculation: "x = 15 / 3", working: "", answer: "x = 5" }
                        ],
                        finalAnswer: "x = 5"
                    },
                    options: [
                        { label: "A", value: "x = 5", isCorrect: true },
                        { label: "B", value: "x = 6", isCorrect: false },
                        { label: "C", value: "x = 4", isCorrect: false },
                        { label: "D", value: "x = 7", isCorrect: false }
                    ]
                },
                {
                    id: 8,
                    question: "2(x - 3) + 5 = 3x - 7 සමීකරණය විසඳන්න.",
                    marks: 8,
                    difficulty: "medium",
                    guidelines: {
                        title: "වරහන් සහිත සමීකරණ",
                        titleEnglish: "Equations with Brackets",
                        concept: "වරහන් සහිත සමීකරණ විසඳීමේදී පළමුව වරහන් විවෘත කළ යුතුය.",
                        rules: [
                            { rule: "පළමුව වරහන් විවෘත කරන්න", ruleEnglish: "First expand the brackets", formula: "a(x + b) = ax + ab" },
                            { rule: "x පද එකතු කරන්න", ruleEnglish: "Collect x terms", formula: "" }
                        ],
                        tips: ["වරහන් විවෘත කිරීමේදී සෘණ ලකුණු ගැන සැලකිලිමත් වන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "වරහන් විවෘත කිරීම", calculation: "2(x - 3) + 5 = 3x - 7", working: "2x - 6 + 5 = 3x - 7", answer: "2x - 1 = 3x - 7" },
                            { stepNumber: 2, description: "x පද එකතු කිරීම", calculation: "2x - 3x = -7 + 1", working: "-x = -6", answer: "" },
                            { stepNumber: 3, description: "x සඳහා විසඳීම", calculation: "x = 6", working: "", answer: "x = 6" }
                        ],
                        finalAnswer: "x = 6"
                    },
                    options: [
                        { label: "A", value: "x = 6", isCorrect: true },
                        { label: "B", value: "x = 4", isCorrect: false },
                        { label: "C", value: "x = -6", isCorrect: false },
                        { label: "D", value: "x = 8", isCorrect: false }
                    ]
                },
                {
                    id: 9,
                    question: "සංඛ්‍යා දෙකක එකතුව 45 කි.  එක් සංඛ්‍යාව අනෙකට වඩා 9 කින් වැඩි නම්, එම සංඛ්‍යා දෙක සොයන්න.",
                    marks: 7,
                    difficulty: "medium",
                    guidelines: {
                        title: "වචන ගැටලු - සමීකරණ සැකසීම",
                        titleEnglish: "Word Problems - Setting Up Equations",
                        concept: "වචන ගැටලුවක් විසඳීමට පළමුව නොදන්නා අගයන් සඳහා විචල්‍යයන් නියම කරන්න.",
                        rules: [
                            { rule: "කුඩා සංඛ්‍යාව x ලෙස ගන්න", ruleEnglish: "Let smaller number be x", formula: "" },
                            { rule: "වැඩි සංඛ්‍යාව x + 9 වේ", ruleEnglish: "Larger number = x + 9", formula: "" }
                        ],
                        tips: ["නොදන්නා දෙයට විචල්‍යයක් යොදන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "විචල්‍යයන් නියම කිරීම", calculation: "කුඩා සංඛ්‍යාව = x", working: "වැඩි සංඛ්‍යාව = x + 9", answer: "" },
                            { stepNumber: 2, description: "සමීකරණය සැකසීම", calculation: "x + (x + 9) = 45", working: "2x + 9 = 45", answer: "2x = 36" },
                            { stepNumber: 3, description: "සංඛ්‍යා සෙවීම", calculation: "x = 18", working: "කුඩා සංඛ්‍යාව = 18", answer: "වැඩි සංඛ්‍යාව = 27" }
                        ],
                        finalAnswer: "සංඛ්‍යා දෙක:  18 සහ 27"
                    },
                    options: [
                        { label: "A", value: "18 සහ 27", isCorrect: true },
                        { label: "B", value: "20 සහ 25", isCorrect: false },
                        { label: "C", value: "15 සහ 30", isCorrect: false },
                        { label: "D", value: "16 සහ 29", isCorrect: false }
                    ]
                }
            ]
        },

        // SECTION 5: PROFIT & LOSS
        {
            id: "profit-loss",
            name: "කොටස V - ලාභ හානි",
            nameEnglish: "Section V - Profit & Loss",
            marks: 20,
            icon: "📊",
            color: "red",
            questions: [
                {
                    id: 10,
                    question: "වෙළෙන්දෙකු රු. 4,500 කට මිල දී ගත් භාණ්ඩයක් 25% ලාභයක් ලැබෙන පරිදි විකුණා ඇත. විකුණුම් මිල කොපමණද?",
                    marks: 8,
                    difficulty: "easy",
                    guidelines: {
                        title: "ලාභ ගණනය",
                        titleEnglish: "Profit Calculations",
                        concept: "ලාභය යනු විකුණුම් මිල සහ මිල දී ගත් මිල අතර ධනාත්මක වෙනසයි.",
                        rules: [
                            { rule: "ලාභය = (ලාභ % / 100) × මිල දී ගත් මිල", ruleEnglish: "Profit = (Profit % / 100) × Cost Price", formula: "P = (L% × CP) / 100" },
                            { rule: "විකුණුම් මිල = මිල දී ගත් මිල + ලාභය", ruleEnglish: "Selling Price = Cost Price + Profit", formula: "SP = CP + P" }
                        ],
                        tips: ["ලාභ ප්‍රතිශතය CP මත ගණනය වේ"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "ලාභය ගණනය කිරීම", calculation: "ලාභය = (25/100) × රු. 4,500", working: "= 0.25 × රු. 4,500", answer: "= රු. 1,125" },
                            { stepNumber: 2, description: "විකුණුම් මිල ගණනය කිරීම", calculation: "විකුණුම් මිල = මිල දී ගත් මිල + ලාභය", working: "= රු. 4,500 + රු. 1,125", answer: "= රු. 5,625" }
                        ],
                        finalAnswer: "විකුණුම් මිල = රු. 5,625"
                    },
                    options: [
                        { label: "A", value: "රු. 5,625", isCorrect: true },
                        { label: "B", value: "රු. 5,500", isCorrect: false },
                        { label: "C", value: "රු. 5,400", isCorrect: false },
                        { label: "D", value: "රු. 5,750", isCorrect: false }
                    ]
                },
                {
                    id: 11,
                    question: "භාණ්ඩයක් රු. 3,200 කට මිල දී ගෙන රු. 2,880 කට විකුණන ලදී. හානි ප්‍රතිශතය ගණනය කරන්න.",
                    marks: 7,
                    difficulty: "medium",
                    guidelines: {
                        title: "හානි ප්‍රතිශතය ගණනය",
                        titleEnglish: "Loss Percentage Calculation",
                        concept: "විකුණුම් මිල මිල දී ගත් මිලට වඩා අඩු නම් හානියක් වේ.",
                        rules: [
                            { rule: "හානිය = මිල දී ගත් මිල - විකුණුම් මිල", ruleEnglish: "Loss = Cost Price - Selling Price", formula: "L = CP - SP" },
                            { rule: "හානි % = (හානිය / මිල දී ගත් මිල) × 100", ruleEnglish: "Loss % = (Loss / Cost Price) × 100", formula: "L% = (L/CP) × 100" }
                        ],
                        tips: ["SP < CP නම් හානියක්"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "හානිය ගණනය කිරීම", calculation: "හානිය = මිල දී ගත් මිල - විකුණුම් මිල", working: "= රු. 3,200 - රු. 2,880", answer: "= රු. 320" },
                            { stepNumber: 2, description: "හානි ප්‍රතිශතය ගණනය කිරීම", calculation: "හානි % = (හානිය / මිල දී ගත් මිල) × 100", working: "= (රු. 320 / රු. 3,200) × 100", answer: "= 10%" }
                        ],
                        finalAnswer: "හානි ප්‍රතිශතය = 10%"
                    },
                    options: [
                        { label: "A", value: "10%", isCorrect: true },
                        { label: "B", value: "8%", isCorrect: false },
                        { label: "C", value: "12%", isCorrect: false },
                        { label: "D", value: "15%", isCorrect: false }
                    ]
                },
                {
                    id: 12,
                    question: "වෙළෙන්දෙකු භාණ්ඩයක් 15% ලාභයකට විකුණූ විට රු. 6,900 ක් ලැබුණි. මිල දී ගත් මිල කොපමණද?",
                    marks: 5,
                    difficulty: "medium",
                    guidelines: {
                        title: "මිල දී ගත් මිල සෙවීම",
                        titleEnglish: "Finding Cost Price",
                        concept: "විකුණුම් මිල සහ ලාභ ප්‍රතිශතය දන්නා විට, මිල දී ගත් මිල ගණනය කළ හැක.",
                        rules: [
                            { rule: "SP = CP × (100 + L%) / 100 සූත්‍රයෙන්", ruleEnglish: "From SP = CP × (100 + P%) / 100", formula: "CP = SP × 100 / (100 + L%)" }
                        ],
                        tips: ["ලාභ % එකතු කර 100 + L% ගන්න"]
                    },
                    solution: {
                        steps: [
                            { stepNumber: 1, description: "සූත්‍රය යෙදීම", calculation: "CP = SP × 100 / (100 + ලාභ %)", working: "= රු. 6,900 × 100 / 115", answer: "" },
                            { stepNumber: 2, description: "ගණනය කිරීම", calculation: "CP = රු. 690,000 / 115", working: "", answer: "= රු. 6,000" }
                        ],
                        finalAnswer: "මිල දී ගත් මිල = රු. 6,000"
                    },
                    options: [
                        { label: "A", value: "රු. 6,000", isCorrect: true },
                        { label: "B", value: "රු. 5,800", isCorrect: false },
                        { label: "C", value: "රු. 6,200", isCorrect: false },
                        { label: "D", value: "රු. 5,500", isCorrect: false }
                    ]
                }
            ]
        }
    ]
};
