export interface QuizQuestion {
  question: string;
  answer: string;
  options: string[];
  topic: string;
}

export const SHINCHEN_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Addition
  {
    question: "What is 7 + 8?",
    answer: "15",
    options: ["15", "14", "16", "13"],
    topic: "addition",
  },
  {
    question: "What is 23 + 19?",
    answer: "42",
    options: ["42", "41", "43", "40"],
    topic: "addition",
  },
  {
    question: "What is 45 + 38?",
    answer: "83",
    options: ["83", "82", "84", "81"],
    topic: "addition",
  },
  // Subtraction
  {
    question: "What is 17 - 9?",
    answer: "8",
    options: ["8", "7", "9", "6"],
    topic: "subtraction",
  },
  {
    question: "What is 35 - 18?",
    answer: "17",
    options: ["17", "16", "18", "15"],
    topic: "subtraction",
  },
  // Fractions
  {
    question: "What is 1/2 + 1/4?",
    answer: "3/4",
    options: ["3/4", "2/4", "1/4", "1/6"],
    topic: "fractions",
  },
  {
    question: "Simplify 6/8",
    answer: "3/4",
    options: ["3/4", "2/3", "4/6", "1/2"],
    topic: "fractions",
  },
  {
    question: "What is 2/3 × 3/4?",
    answer: "1/2",
    options: ["1/2", "6/12", "2/4", "5/7"],
    topic: "fractions",
  },
  // Decimals
  {
    question: "What is 0.3 + 0.7?",
    answer: "1.0",
    options: ["1.0", "0.10", "1.1", "0.97"],
    topic: "decimals",
  },
  {
    question: "What is 2.5 × 4?",
    answer: "10",
    options: ["10", "8", "12", "9"],
    topic: "decimals",
  },
  // Algebra
  {
    question: "Solve: 2x = 14",
    answer: "7",
    options: ["7", "12", "28", "6"],
    topic: "algebra",
  },
  {
    question: "Solve: x + 5 = 12",
    answer: "7",
    options: ["7", "17", "5", "6"],
    topic: "algebra",
  },
  {
    question: "Solve: 3x - 6 = 9",
    answer: "5",
    options: ["5", "3", "15", "6"],
    topic: "algebra",
  },
  // Geometry
  {
    question: "Area of rectangle: length=6, width=4?",
    answer: "24",
    options: ["24", "20", "10", "28"],
    topic: "geometry",
  },
  {
    question: "Perimeter of square: side=5?",
    answer: "20",
    options: ["20", "25", "10", "15"],
    topic: "geometry",
  },
  {
    question: "Area of triangle: base=8, height=6?",
    answer: "24",
    options: ["24", "48", "28", "12"],
    topic: "geometry",
  },
  // Quadratics
  {
    question: "Solve: x² = 25",
    answer: "±5",
    options: ["±5", "5", "12.5", "625"],
    topic: "quadratics",
  },
  {
    question: "Expand: (x+3)² = ?",
    answer: "x²+6x+9",
    options: ["x²+6x+9", "x²+9", "x²+3x+9", "x²+6x+6"],
    topic: "quadratics",
  },
  // Trigonometry
  {
    question: "sin(90°) = ?",
    answer: "1",
    options: ["1", "0", "0.5", "√2/2"],
    topic: "trigonometry",
  },
  {
    question: "cos(0°) = ?",
    answer: "1",
    options: ["1", "0", "-1", "0.5"],
    topic: "trigonometry",
  },
  {
    question: "tan(45°) = ?",
    answer: "1",
    options: ["1", "0", "√3", "1/√2"],
    topic: "trigonometry",
  },
  // Calculus
  {
    question: "d/dx(x²) = ?",
    answer: "2x",
    options: ["2x", "x²", "x", "2"],
    topic: "calculus",
  },
  {
    question: "d/dx(5x³) = ?",
    answer: "15x²",
    options: ["15x²", "5x²", "15x", "x³"],
    topic: "calculus",
  },
  {
    question: "d/dx(sin x) = ?",
    answer: "cos x",
    options: ["cos x", "-sin x", "-cos x", "tan x"],
    topic: "calculus",
  },
  // Probability
  {
    question: "P(rolling 6 on a die) = ?",
    answer: "1/6",
    options: ["1/6", "1/3", "1/2", "6/1"],
    topic: "probability",
  },
  {
    question: "P(heads on coin) = ?",
    answer: "1/2",
    options: ["1/2", "1/4", "3/4", "1"],
    topic: "probability",
  },
  // Matrices
  {
    question: "[[1,0],[0,1]] × [[3,4],[5,6]] = ?",
    answer: "[[3,4],[5,6]]",
    options: [
      "[[3,4],[5,6]]",
      "[[0,0],[0,0]]",
      "[[1,0],[0,1]]",
      "[[4,5],[6,7]]",
    ],
    topic: "matrices",
  },
  {
    question: "det([[2,0],[0,3]]) = ?",
    answer: "6",
    options: ["6", "0", "5", "-6"],
    topic: "matrices",
  },
  // Integers
  {
    question: "-5 + 8 = ?",
    answer: "3",
    options: ["3", "-3", "13", "-13"],
    topic: "integers",
  },
  {
    question: "-4 × -3 = ?",
    answer: "12",
    options: ["12", "-12", "7", "-7"],
    topic: "integers",
  },
  // Graphs
  {
    question: "Slope of y=4x-2 = ?",
    answer: "4",
    options: ["4", "-2", "2", "-4"],
    topic: "graphs",
  },
  {
    question: "y-intercept of y=3x+7 = ?",
    answer: "7",
    options: ["7", "3", "-7", "3/7"],
    topic: "graphs",
  },
  // Ratios
  {
    question: "Simplify ratio 12:8 = ?",
    answer: "3:2",
    options: ["3:2", "6:4", "4:3", "2:3"],
    topic: "ratios",
  },
  // Patterns
  {
    question: "Sequence: 1, 4, 9, 16, next = ?",
    answer: "25",
    options: ["25", "20", "23", "17"],
    topic: "patterns",
  },
  {
    question: "Arithmetic: 3, 7, 11, 15, next = ?",
    answer: "19",
    options: ["19", "17", "18", "20"],
    topic: "patterns",
  },
];
