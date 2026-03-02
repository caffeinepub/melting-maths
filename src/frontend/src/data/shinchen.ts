export const SHINCHEN_GREETINGS = [
  "Hmm 🤔 Let's solve this together!",
  "Boom! You're doing great! Keep it up! 🚀",
  "You're leveling up! Keep going! ⚡",
  "Hey superstar! Ready for a math adventure? ✨",
  "Math is your superpower! Let's unlock it! 💫",
  "Welcome back, Math Champion! 🏆",
  "Every problem is just a puzzle waiting to be solved! 🧩",
  "I believe in you! Let's crush these numbers! 💪",
];

export const SHINCHEN_HINTS: Record<string, string[]> = {
  addition: [
    "Try counting on your fingers first! Start from the bigger number. ✋",
    "Break big numbers into smaller parts. 10 + 7 = think of it as 10 + 5 + 2!",
    "Remember: addition is just counting forward on the number line! ➡️",
    "Group numbers that make 10 together — they're best friends! 👫",
    "For double digits: add the tens first, then the ones. 23 + 45 = (20+40) + (3+5)!",
    "Use the commutative property: 7 + 3 = 3 + 7. Pick the easier order! 🔄",
    "Round up, then subtract! 29 + 15 = 30 + 15 - 1 = 44. Mental trick! 🧠",
    "Practice makes perfect! The more you add, the faster your brain gets! ⚡",
  ],
  subtraction: [
    "Think of subtraction as finding the gap between two numbers! 📏",
    "Count up from the smaller number to the larger one — count the steps!",
    "Use the inverse: if 7 + 5 = 12, then 12 - 5 = 7. Addition helps subtraction! 🔄",
    "For big numbers, subtract in parts: 45 - 17 = 45 - 10 - 7 = 28. Easy! 🧩",
    "Borrow from the tens place when the units digit is too small!",
    "Check your answer by adding it back: if 15 - 6 = 9, check 9 + 6 = 15! ✅",
    "Line up digits by place value — units under units, tens under tens! 📐",
    "Negative? That means you went too far! Switch the order and add a minus! 🔄",
  ],
  fractions: [
    "Remember: to compare fractions, find a common denominator first! 🔢",
    "Think of fractions as pizza slices. More slices = smaller pieces! 🍕",
    "Multiply top and bottom by the same number to find equivalent fractions!",
    "The denominator tells you HOW MANY pieces. The numerator tells you HOW MANY you have! 🎯",
    "To add/subtract fractions: get the same denominator, then add/subtract the top! ➕",
    "To multiply fractions: multiply tops, multiply bottoms. Simple! × = ×",
    "To divide fractions: flip the second fraction and multiply! ÷ = × flipped!",
    "Simplify by finding the GCD (Greatest Common Divisor) of top and bottom! 🔍",
  ],
  decimals: [
    "Line up the decimal points when adding or subtracting decimals! 📍",
    "Decimals are just fractions in disguise: 0.5 = 1/2, 0.25 = 1/4! 🎭",
    "Multiply decimals: ignore decimals first, multiply, then count decimal places! 🔢",
    "Dividing by 0.1 = multiplying by 10. Dividing by 0.01 = × 100! 💡",
    "0.1 = 1 tenth, 0.01 = 1 hundredth, 0.001 = 1 thousandth. Place value matters!",
    "To compare decimals: look at each digit from left to right! 👈",
    "Add zeros after the decimal if needed — 0.5 and 0.50 are the same! 🟰",
    "Round to the nearest tenth: look at the hundredths digit. ≥5 rounds up! ↑",
  ],
  time: [
    "There are 60 minutes in 1 hour and 24 hours in a day! ⏰",
    "Count forward by 15-minute jumps: :00, :15, :30, :45, :00 next hour!",
    "Elapsed time = End time - Start time. Convert to all minutes to make it easier!",
    "1 hour = 60 min, 2 hours = 120 min, 3 hours = 180 min... just multiply by 60!",
    "AM = before noon, PM = after noon. Midnight is 12:00 AM, noon is 12:00 PM!",
    "To convert 24hr to 12hr: if > 12, subtract 12 and add PM. 14:00 = 2:00 PM!",
    "Time problems are easier on a number line — draw hours and count! 📏",
    "Half past = :30, Quarter past = :15, Quarter to = :45 (next hour)! 🕐",
  ],
  geometry: [
    "Area of rectangle = length × width. Think: rows × columns! 📐",
    "Area of triangle = ½ × base × height. It's half a rectangle! △",
    "Area of circle = π × r² ≈ 3.14159 × radius × radius! ⭕",
    "Perimeter = total distance around the outside. Add all sides! 🔲",
    "For circles: diameter = 2 × radius. Circumference = 2πr or πd! 🔵",
    "Volume = Area of base × height (for prisms)! Think: layers! 📦",
    "Similar shapes have the same angles but different sizes! 🔍",
    "Pythagoras: a² + b² = c² for right triangles. Super useful! 📐",
  ],
  integers: [
    "Think of negative numbers as debt and positive numbers as money! 💸",
    "Number line: negative is left, positive is right. Move accordingly! ←→",
    "Negative × Negative = Positive (enemies of enemies = friends)! ⚡",
    "Positive × Negative = Negative (friends and enemies = trouble)! ❌",
    "Adding a negative = subtracting: 5 + (-3) = 5 - 3 = 2! 🔄",
    "Subtracting a negative = adding: 5 - (-3) = 5 + 3 = 8! Mind blown! 🤯",
    "Order of operations matters: BODMAS/PEMDAS! Brackets first! 📋",
    "Absolute value |x| = distance from zero. Always positive! |−5| = 5! 📏",
  ],
  algebra: [
    "Isolate x! Move numbers to one side and x to the other. ⚖️",
    "Whatever you do to one side, do to the other! That's the golden rule! 👑",
    "Think of x as a mystery box. You're a detective solving the mystery! 🕵️",
    "Try substituting your answer back into the equation to check! ✅",
    "Expand brackets first: 2(x+3) = 2x + 6. Distribute carefully! 🔓",
    "Collect like terms: 3x + 2x = 5x. Same variables together! 🤝",
    "Factoring: reverse of expanding. Find common factors! 🔍",
    "If both sides have x, move all x's to one side and constants to the other! ⚖️",
  ],
  quadratics: [
    "Try factoring: find two numbers that multiply to c and add to b in ax²+bx+c. 🔍",
    "When stuck, try the quadratic formula: x = (-b ± √(b²-4ac)) / 2a 📐",
    "Check: do your roots multiply to give c? Do they add to give -b? 🧮",
    "Look for perfect square trinomials — they factor super cleanly! ✨",
    "Discriminant b²-4ac tells you: >0 two roots, =0 one root, <0 no real roots! 🎯",
    "Complete the square: (x + b/2)² - (b/2)² + c = 0 is another method!",
    "Graphically: roots are where the parabola crosses the x-axis! 📈",
    "Always expand and simplify before factoring! Messy equations hide patterns. 🧹",
  ],
  trigonometry: [
    "Remember SOH CAH TOA: Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj! 📐",
    "The hypotenuse is always opposite the right angle and is the longest side! 📏",
    "sin(30°)=1/2, sin(60°)=√3/2, sin(45°)=√2/2. These are common values! 🎯",
    "For inverse trig: sin⁻¹(0.5) = 30°. It reverses the operation! 🔄",
    "Pythagoras still works: opposite² + adjacent² = hypotenuse²! 📐",
    "sin²θ + cos²θ = 1 always. This identity is super useful! ✨",
    "tan(θ) = sin(θ)/cos(θ). When cosine is 0, tangent is undefined!",
    "Draw a right triangle and label all sides before solving! 📝",
  ],
  graphs: [
    "Slope (m) = rise/run = (y₂-y₁)/(x₂-x₁). How steep is the line? 📈",
    "y-intercept (b) is where the line crosses the y-axis (x=0)! 📍",
    "Slope-intercept form: y = mx + b. m is slope, b is y-intercept! ✏️",
    "Positive slope goes up-right ↗️, negative slope goes down-right ↘️!",
    "Parallel lines have the same slope. Perpendicular lines: slopes multiply to -1!",
    "To find x-intercept: set y=0 and solve for x! 🎯",
    "Steeper slope = larger |m| value. Flat line = slope of 0!",
    "Two points define a line: find slope first, then use y = mx + b! 📐",
  ],
  matrices: [
    "Matrix addition: add corresponding elements. Same position + same position! ➕",
    "Scalar multiplication: multiply every element by the scalar! × each cell",
    "Matrix multiplication: row × column! Each element = dot product of row and col! 🔄",
    "Order matters in matrix multiplication: A×B ≠ B×A in general! ⚠️",
    "Identity matrix: 1s on diagonal, 0s elsewhere. A × I = A! 🪞",
    "Determinant of 2×2: ad - bc for [[a,b],[c,d]]. Used for finding inverse! 🔍",
    "Matrices must have same dimensions to add/subtract! Check sizes first! 📏",
    "For A×B: A must have same columns as B has rows! Dimensions must match! 📐",
  ],
  calculus: [
    "Power rule: bring the exponent down and reduce it by 1. d/dx(xⁿ) = nxⁿ⁻¹ 📉",
    "Chain rule: derivative of outside × derivative of inside! 🔗",
    "Product rule: uv' + vu'. Don't forget BOTH parts! 🤝",
    "The derivative is just the SLOPE of the function at any point! 📈",
    "Constant rule: d/dx(constant) = 0. Constants disappear in derivatives! 🧹",
    "Sum rule: d/dx(f+g) = f' + g'. Derivatives add up! ➕",
    "d/dx(eˣ) = eˣ. The exponential function is its own derivative! 🌟",
    "d/dx(sin x) = cos x, d/dx(cos x) = -sin x. These are important! 🔄",
  ],
  probability: [
    "P(event) = favorable outcomes ÷ total outcomes. Always between 0 and 1! 🎲",
    "P(A and B) = P(A) × P(B) when events are INDEPENDENT! 🔗",
    "P(A or B) = P(A) + P(B) - P(A and B). Don't double count! ➕",
    "Conditional probability P(A|B) = P(A∩B) / P(B). Read as 'A given B'!",
    "P(not A) = 1 - P(A). Complements always sum to 1! 🔄",
    "Tree diagrams help with multi-step probability problems! 🌳",
    "With replacement: probability stays same each draw. Without: it changes!",
    "Expected value = Σ(outcome × probability). Average over many trials! 📊",
  ],
};

export const SHINCHEN_STEP_BY_STEP: Record<string, string[]> = {
  addition: [
    "Step 1: Write the numbers one above the other, aligning digits by place value.",
    "Step 2: Start with the rightmost (units) column. Add those digits.",
    "Step 3: If the sum ≥ 10, write the units digit and carry the 1 to the next column.",
    "Step 4: Move left to the tens column. Add those digits PLUS any carry.",
    "Step 5: Repeat for hundreds, thousands, etc.",
    "Step 6: Check: the answer should be larger than both numbers you added! ✅",
  ],
  subtraction: [
    "Step 1: Write the bigger number on top, smaller below. Line up place values.",
    "Step 2: Start with the units column. Can you subtract the bottom from the top?",
    "Step 3: If not, BORROW from the tens column. Reduce tens by 1, add 10 to units.",
    "Step 4: Now subtract the units column.",
    "Step 5: Move to the tens column (remember: you borrowed, so it's reduced by 1!)",
    "Step 6: Verify: add your answer to the smaller number — you should get the bigger number! ✅",
  ],
  fractions: [
    "Step 1: Check the denominators (bottom numbers). Are they the same?",
    "Step 2: If NOT same: find the LCM (Least Common Multiple) of the denominators.",
    "Step 3: Convert each fraction to the common denominator by multiplying top and bottom.",
    "Step 4: Now add or subtract ONLY the numerators (top numbers). Keep denominator!",
    "Step 5: Simplify the result by dividing top and bottom by their GCD.",
    "Step 6: Check: does your answer make sense? Is it between the two fractions? ✅",
  ],
  decimals: [
    "Step 1: Line up the decimal points vertically. This is the key step!",
    "Step 2: Fill in zeros on the right if needed (0.5 = 0.50).",
    "Step 3: Add or subtract as if they were whole numbers.",
    "Step 4: Place the decimal point straight down in the answer.",
    "Step 5: For multiplication: ignore decimals first, multiply, then count total decimal places.",
    "Step 6: Double-check by estimating: 1.2 + 0.5 should be close to 1.7. ✅",
  ],
  algebra: [
    "Step 1: Identify what you need to solve for (usually x).",
    "Step 2: Expand any brackets first (distribute multiplication).",
    "Step 3: Collect like terms on each side.",
    "Step 4: Move all x terms to one side using addition/subtraction.",
    "Step 5: Move all constants to the other side.",
    "Step 6: Divide (or multiply) both sides to isolate x.",
    "Step 7: CHECK: substitute your answer back in. Both sides should be equal! ✅",
  ],
  quadratics: [
    "Step 1: Write in standard form: ax² + bx + c = 0.",
    "Step 2: Try factoring first. Find two numbers that multiply to ac and add to b.",
    "Step 3: If factoring works, write as (x + p)(x + q) = 0.",
    "Step 4: Set each bracket to zero: x + p = 0 gives x = -p, etc.",
    "Step 5: If factoring doesn't work, use: x = (-b ± √(b²-4ac)) / 2a",
    "Step 6: Calculate discriminant b²-4ac first to know how many solutions exist.",
    "Step 7: CHECK: substitute roots back into the original equation! ✅",
  ],
  trigonometry: [
    "Step 1: Draw and label the right triangle. Mark the right angle!",
    "Step 2: Label the sides: Hypotenuse (longest), Opposite (across from angle), Adjacent (next to angle).",
    "Step 3: Choose the right ratio: SOH (sin), CAH (cos), TOA (tan).",
    "Step 4: Set up the equation: sin(θ) = opposite/hypotenuse, etc.",
    "Step 5: Cross-multiply to find the unknown side.",
    "Step 6: For finding an angle, use inverse trig: θ = sin⁻¹(opp/hyp).",
    "Step 7: CHECK: verify using Pythagoras a² + b² = c²! ✅",
  ],
  matrices: [
    "Step 1: Check the dimensions of your matrices (rows × columns).",
    "Step 2: For addition: matrices must be same size. Add element by element.",
    "Step 3: For scalar multiplication: multiply every single element by the scalar.",
    "Step 4: For matrix multiplication: A(m×n) × B(n×p) gives C(m×p).",
    "Step 5: C[i][j] = sum of A[i][k] × B[k][j] for all k. Row × Column!",
    "Step 6: CHECK: verify dimensions of result match what you expected. ✅",
  ],
  calculus: [
    "Step 1: Identify the type: power rule, chain rule, product rule, or quotient rule.",
    "Step 2: Power rule d/dx(xⁿ) = nxⁿ⁻¹: bring down exponent, reduce by 1.",
    "Step 3: Chain rule: derivative of outer function × derivative of inner function.",
    "Step 4: Product rule d/dx(uv) = u'v + uv': differentiate each part separately.",
    "Step 5: Quotient rule d/dx(u/v) = (u'v - uv') / v²: careful with the signs!",
    "Step 6: Simplify your answer if possible.",
    "Step 7: CHECK: evaluate at a simple point and verify slope makes sense! ✅",
  ],
  probability: [
    "Step 1: Identify the event and the sample space (all possible outcomes).",
    "Step 2: Count favorable outcomes carefully.",
    "Step 3: P(event) = favorable outcomes / total outcomes.",
    "Step 4: For combined events: are they independent? P(A and B) = P(A) × P(B).",
    "Step 5: For OR: P(A or B) = P(A) + P(B) - P(A and B).",
    "Step 6: For conditional: P(A|B) = P(A and B) / P(B).",
    "Step 7: CHECK: all probabilities must be between 0 and 1! ✅",
  ],
  geometry: [
    "Step 1: Identify the shape and which formula applies.",
    "Step 2: Rectangle area: A = length × width. Label the measurements!",
    "Step 3: Triangle area: A = ½ × base × height (height must be perpendicular!).",
    "Step 4: Circle area: A = π × r². Remember r = radius (not diameter)!",
    "Step 5: Substitute the numbers carefully. Watch your units!",
    "Step 6: Calculate and include units in your answer (cm², m², etc.).",
    "Step 7: CHECK: does the answer seem reasonable for the shape size? ✅",
  ],
  time: [
    "Step 1: Convert all times to minutes if needed (multiply hours by 60).",
    "Step 2: For elapsed time: end time - start time. Borrow 60 minutes if needed.",
    "Step 3: For adding time: add minutes first, if ≥ 60 carry 1 hour.",
    "Step 4: Convert back to hours and minutes if needed (÷60 for hours, remainder = mins).",
    "Step 5: Check AM/PM: if you cross noon or midnight, switch AM/PM!",
    "Step 6: CHECK: does your answer make sense on a clock? ✅",
  ],
  integers: [
    "Step 1: Draw a number line in your head. Negative left, positive right!",
    "Step 2: For addition: same signs = add and keep sign. Different signs = subtract and keep sign of bigger!",
    "Step 3: For subtraction: change to addition by flipping the second sign! a - b = a + (-b).",
    "Step 4: For multiplication/division: same signs = positive. Different signs = negative.",
    "Step 5: For expressions like -3 × (4 + -2): work inside brackets first!",
    "Step 6: CHECK: does the sign of your answer make sense? ✅",
  ],
  graphs: [
    "Step 1: Write the equation in slope-intercept form: y = mx + b.",
    "Step 2: Identify m (slope) and b (y-intercept) directly.",
    "Step 3: Plot the y-intercept point (0, b) on the y-axis.",
    "Step 4: Use slope m = rise/run: from y-intercept, go up rise, right run.",
    "Step 5: Connect the points with a straight line.",
    "Step 6: For finding slope from two points: m = (y₂-y₁)/(x₂-x₁).",
    "Step 7: CHECK: pick a point on the line and verify it satisfies the equation! ✅",
  ],
};

export const SHINCHEN_ENCOURAGEMENT_GOOD = [
  "BOOM! You're on fire! 🔥 Score like that? Legend status!",
  "That was incredible! You just proved math is your superpower! ⚡",
  "YES! That's what I'm talking about! Level up! 🏆",
  "Outstanding work! Shinchen is proud of you! 🌟",
  "You absolutely crushed it! Time to celebrate! 🎉",
];

export const SHINCHEN_ENCOURAGEMENT_BAD = [
  "Hey, don't give up! Every wrong answer teaches you something. 💪",
  "You're still learning — and that's amazing! Let's practice together! 🤝",
  "Mistakes are just stepping stones to mastery! Try again! ✨",
  "I've seen your potential! A little more practice and you'll nail it! 🎯",
  "Math is a journey, not a race. Keep going — you're getting better! 🚀",
];

export const SHINCHEN_DAILY_CHALLENGES = [
  "Today's challenge: Can you solve 3 algebra equations in a row? Go for it! 🏃",
  "Daily quest: Beat Level 2 of any game with 80%+ score! You can do it! ⭐",
  "Challenge of the day: Practice fractions — they appear everywhere in real life! 🍕",
  "Today: Try a game one grade above yours for extra XP! 💫",
  "Daily brain boost: Solve 5 mental math problems before breakfast! 🧠",
  "Today's mission: Complete all 3 levels of one game in a single session! 🎯",
  "Challenge: Try trigonometry or matrices today — push your limits! 📐",
  "Streak challenge: Play 3 different games today to keep your streak alive! 🔥",
];

export const SHINCHEN_KEYWORD_RESPONSES: Array<{
  keywords: string[];
  responses: string[];
}> = [
  {
    keywords: ["hint", "help", "stuck", "don't understand", "confused"],
    responses: [
      "Of course I'll help! What topic are you stuck on? Tell me: addition, fractions, algebra, quadratics, calculus, trigonometry, or any other topic! 🤔",
      "Let's figure it out together! Which subject is giving you trouble? 💡",
      "Stuck? That just means you're about to learn something new! What topic? 🔍",
    ],
  },
  {
    keywords: ["hard", "difficult", "too hard", "impossible"],
    responses: [
      "Nothing is impossible when you break it into small steps! 🧩 Which part is tricky?",
      "I know it feels hard right now. But I've seen you improve! Keep going! 💪",
      "Hard problems just need more practice. Let's go through it step by step! 📝",
    ],
  },
  {
    keywords: ["easy", "simple", "boring"],
    responses: [
      "Love that confidence! Ready for a harder challenge? Try the next level! 🚀",
      "You're too good for easy! Time to level up and face harder problems! ⚡",
      "A master finds everything easy because they practiced hard! Respect! 🏆",
    ],
  },
  {
    keywords: ["tired", "bored", "quit", "stop"],
    responses: [
      "Take a 5-minute break! Your brain needs rest to grow stronger! 😴 Come back refreshed!",
      "Rest is part of learning! But don't quit — you're so close to leveling up! 💤",
      "Even champions rest. But remember: your streak is counting on you! 🔥",
    ],
  },
  {
    keywords: ["score", "xp", "points", "level"],
    responses: [
      "XP is earned by playing games and getting correct answers! Higher scores = more XP! 💰",
      "Your level = total XP ÷ 100. Keep playing to level up faster! 📊",
      "Aim for 80%+ on each game to maximize your XP gains! 🎯",
    ],
  },
  {
    keywords: ["hello", "hi", "hey", "sup", "wassup"],
    responses: [
      "Hey hey hey! Shinchen is HERE and ready to help! 🌟 What's on your mind?",
      "Hello, Math Champion! I've been waiting for you! 😄 Let's talk numbers!",
      "Hiiii! Great to see you back! Ready for some math adventures? ✨",
    ],
  },
  {
    keywords: ["badge", "achievement", "trophy"],
    responses: [
      "Badges are earned by special accomplishments — perfect scores, XP milestones, and playing all games! 🏅",
      "You can see all available badges in your Profile! Some are secret — keep playing to discover them! 🔍",
      "The rarest badge? Playing ALL 15 games! Are you up for the challenge? 🌍",
    ],
  },
  {
    keywords: ["game", "games", "play", "which game"],
    responses: [
      "There are 15 games covering everything from basic addition to calculus! Head to Game Select! 🎮",
      "My favorites? Quadratic Boss Fight and Matrix Code Breaker are epic! But start with your grade! ⚡",
      "Each game has 3 levels of increasing difficulty. Start at Level 1 and work your way up! 🚀",
    ],
  },
];

export const SHINCHEN_FALLBACK = [
  "Interesting question! I'm still learning to understand everything, but I'm here to help with your math! 🤔",
  "Hmm, let me think... Why not try one of the games to practice? I'll give hints when needed! 🎮",
  "Great chat! Remember, I'm always here for math hints and encouragement! 💬",
  "Keep asking questions — curious minds learn the fastest! 🧠✨",
];

const EXPLAIN_KEYWORDS = [
  "explain",
  "step by step",
  "how do i",
  "walk me through",
  "show me how",
  "how to solve",
  "how do you",
];

const TOPIC_DETECTOR: Array<{ keywords: string[]; topic: string }> = [
  { keywords: ["add", "addition", "plus", "sum"], topic: "addition" },
  {
    keywords: ["subtract", "subtraction", "minus", "difference"],
    topic: "subtraction",
  },
  {
    keywords: ["fraction", "denominator", "numerator", "divide"],
    topic: "fractions",
  },
  { keywords: ["decimal", "0.", "point"], topic: "decimals" },
  { keywords: ["time", "hour", "minute", "clock", "am", "pm"], topic: "time" },
  {
    keywords: [
      "geometry",
      "area",
      "rectangle",
      "triangle",
      "circle",
      "perimeter",
    ],
    topic: "geometry",
  },
  { keywords: ["integer", "negative", "positive"], topic: "integers" },
  {
    keywords: ["algebra", "equation", "variable", "solve for x"],
    topic: "algebra",
  },
  {
    keywords: ["quadratic", "x²", "parabola", "roots", "factor"],
    topic: "quadratics",
  },
  {
    keywords: [
      "trig",
      "trigonometry",
      "sin",
      "cos",
      "tan",
      "hypotenuse",
      "angle",
    ],
    topic: "trigonometry",
  },
  {
    keywords: ["graph", "slope", "intercept", "linear", "y=mx"],
    topic: "graphs",
  },
  { keywords: ["matrix", "matrices", "determinant"], topic: "matrices" },
  {
    keywords: ["calculus", "derivative", "d/dx", "differentiate", "integral"],
    topic: "calculus",
  },
  {
    keywords: ["probability", "chance", "likelihood", "p("],
    topic: "probability",
  },
];

export function getShinchenResponse(
  message: string,
  weakTopics: string[],
): string {
  const lower = message.toLowerCase();

  // Check for explain/step-by-step pattern first
  const isExplain = EXPLAIN_KEYWORDS.some((k) => lower.includes(k));
  if (isExplain) {
    // Detect topic from message
    for (const { keywords, topic } of TOPIC_DETECTOR) {
      if (keywords.some((k) => lower.includes(k))) {
        const steps = SHINCHEN_STEP_BY_STEP[topic];
        if (steps) {
          return `Here's how to approach ${topic} step by step:\n\n${steps.map((s) => s).join("\n")}`;
        }
      }
    }
    // Generic step-by-step response
    return "Sure! Tell me which topic you want explained step by step — addition, subtraction, fractions, algebra, trigonometry, calculus, matrices, or probability? 📝";
  }

  // Check keyword matches
  for (const { keywords, responses } of SHINCHEN_KEYWORD_RESPONSES) {
    if (keywords.some((k) => lower.includes(k))) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Topic-specific hints from TOPIC_DETECTOR
  for (const { keywords, topic } of TOPIC_DETECTOR) {
    if (keywords.some((k) => lower.includes(k))) {
      const hints = SHINCHEN_HINTS[topic];
      if (hints) {
        return hints[Math.floor(Math.random() * hints.length)];
      }
    }
  }

  // Weak topics suggestion
  if (weakTopics.length > 0 && Math.random() < 0.3) {
    const topic = weakTopics[0];
    const hints = SHINCHEN_HINTS[topic];
    if (hints) {
      return `I noticed ${topic} is a tricky area for you. Here's a tip: ${hints[Math.floor(Math.random() * hints.length)]}`;
    }
  }

  // Fallback
  return SHINCHEN_FALLBACK[
    Math.floor(Math.random() * SHINCHEN_FALLBACK.length)
  ];
}
