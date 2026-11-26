// StudyPilot - Subject catalog & practice question bank
// Nothing here is shown until the student selects their subjects during onboarding.

const CONFIDENCE_LEVELS = [
  { level: 1, short: "Struggling", seed: 18 },
  { level: 2, short: "Getting there", seed: 34 },
  { level: 3, short: "Comfortable", seed: 52 },
  { level: 4, short: "Confident", seed: 70 },
  { level: 5, short: "Mastered", seed: 86 }
];

function confidenceSeed(level) {
  const found = CONFIDENCE_LEVELS.find(c => c.level === Number(level));
  return found ? found.seed : 40;
}

function confidenceLabel(level) {
  const found = CONFIDENCE_LEVELS.find(c => c.level === Number(level));
  return found ? found.short : "Not rated";
}

const SUBJECT_CATALOG = [
  {
    key: "dsa",
    name: "Data Structures & Algorithms",
    code: "CS301",
    color: "#4F46E5",
    chapters: [
      { name: "Arrays & Strings", topics: ["Two pointers & sliding window", "Prefix sums", "Sorting patterns"] },
      { name: "Trees & Heaps", topics: ["Tree traversals", "Binary search trees", "Heaps & priority queues"] },
      { name: "Dynamic Programming", topics: ["Memoization vs tabulation", "0/1 Knapsack", "Longest common subsequence"] }
    ]
  },
  {
    key: "dbms",
    name: "Database Management Systems",
    code: "CS302",
    color: "#0EA5E9",
    chapters: [
      { name: "Data Modelling", topics: ["ER modelling", "Keys & constraints", "Relational algebra"] },
      { name: "SQL & Normalization", topics: ["Joins & subqueries", "Functional dependencies", "1NF to BCNF"] },
      { name: "Transactions", topics: ["ACID properties", "Two-phase locking", "Deadlock handling"] }
    ]
  },
  {
    key: "os",
    name: "Operating Systems",
    code: "CS303",
    color: "#8B5CF6",
    chapters: [
      { name: "Processes & Scheduling", topics: ["Process states & PCB", "CPU scheduling algorithms", "Context switching"] },
      { name: "Synchronization", topics: ["Critical section problem", "Semaphores & monitors", "Deadlock & Banker's algorithm"] },
      { name: "Memory Management", topics: ["Paging & segmentation", "Page replacement", "Virtual memory & thrashing"] }
    ]
  },
  {
    key: "cn",
    name: "Computer Networks",
    code: "CS304",
    color: "#F59E0B",
    chapters: [
      { name: "Network Layers", topics: ["OSI vs TCP/IP", "Physical & data link layer", "Switching & routing basics"] },
      { name: "IP & Transport", topics: ["IPv4 addressing & subnets", "TCP handshake & flow control", "Congestion control"] },
      { name: "Application Layer", topics: ["DNS & HTTP", "Email protocols", "Network security basics"] }
    ]
  },
  {
    key: "oop",
    name: "Object Oriented Programming",
    code: "CS305",
    color: "#10B981",
    chapters: [
      { name: "Classes & Objects", topics: ["Encapsulation", "Constructors & destructors", "Method overloading"] },
      { name: "Inheritance & Polymorphism", topics: ["Types of inheritance", "Method overriding", "Abstract classes & interfaces"] },
      { name: "Design Principles", topics: ["SOLID principles", "Composition vs inheritance", "Design patterns"] }
    ]
  },
  {
    key: "toc",
    name: "Theory of Computation",
    code: "CS306",
    color: "#EC4899",
    chapters: [
      { name: "Automata", topics: ["DFA & NFA", "Regular expressions", "Pumping lemma"] },
      { name: "Grammars", topics: ["Context-free grammars", "Derivation trees", "Chomsky hierarchy"] },
      { name: "Computability", topics: ["Turing machines", "Decidability", "Halting problem"] }
    ]
  },
  {
    key: "se",
    name: "Software Engineering",
    code: "CS307",
    color: "#14B8A6",
    chapters: [
      { name: "Requirements", topics: ["Functional vs non-functional", "Use case modelling", "SRS documents"] },
      { name: "Design & Architecture", topics: ["UML diagrams", "Layered architecture", "Design patterns"] },
      { name: "Testing & Process", topics: ["Unit vs integration testing", "Agile & Scrum", "Black box vs white box"] }
    ]
  },
  {
    key: "math",
    name: "Discrete Mathematics",
    code: "MA201",
    color: "#EF4444",
    chapters: [
      { name: "Logic & Proofs", topics: ["Propositional logic", "Proof techniques", "Mathematical induction"] },
      { name: "Combinatorics", topics: ["Permutations & combinations", "Pigeonhole principle", "Recurrence relations"] },
      { name: "Graph Theory", topics: ["Graph representations", "Shortest paths & spanning trees", "Colouring & matching"] }
    ]
  },
  {
    key: "stats",
    name: "Probability & Statistics",
    code: "MA202",
    color: "#6366F1",
    chapters: [
      { name: "Probability", topics: ["Conditional probability", "Bayes theorem", "Random variables"] },
      { name: "Distributions", topics: ["Binomial & Poisson", "Normal distribution", "Expectation & variance"] },
      { name: "Inference", topics: ["Sampling distributions", "Confidence intervals", "Hypothesis testing"] }
    ]
  },

  // ---- School: classes 5–8 ---------------------------------------------
  {
    key: "school-maths",
    name: "Mathematics",
    code: "MATH",
    color: "#4F46E5",
    chapters: [
      { name: "Numbers", topics: ["Place value & rounding", "Fractions & decimals", "HCF, LCM & factors"] },
      { name: "Shapes & measurement", topics: ["Perimeter & area", "Angles & triangles", "Time, money & units"] },
      { name: "Data handling", topics: ["Reading tables & pictographs", "Averages", "Simple word problems"] }
    ]
  },
  {
    key: "school-science",
    name: "Science",
    code: "SCI",
    color: "#10B981",
    chapters: [
      { name: "Living world", topics: ["Plants & photosynthesis", "Human body systems", "Food & nutrition"] },
      { name: "Matter & materials", topics: ["States of matter", "Separation methods", "Acids, bases & salts"] },
      { name: "Force, motion & energy", topics: ["Simple machines", "Light & sound", "Electricity basics"] }
    ]
  },
  {
    key: "school-english",
    name: "English",
    code: "ENG",
    color: "#F59E0B",
    chapters: [
      { name: "Grammar", topics: ["Nouns, pronouns & verbs", "Tenses", "Articles & prepositions"] },
      { name: "Reading", topics: ["Comprehension passages", "Vocabulary building", "Poems & stories"] },
      { name: "Writing", topics: ["Paragraph writing", "Letter writing", "Picture composition"] }
    ]
  },
  {
    key: "school-hindi",
    name: "Hindi",
    code: "HIN",
    color: "#EC4899",
    chapters: [
      { name: "व्याकरण", topics: ["संज्ञा, सर्वनाम, क्रिया", "लिंग, वचन, काल", "विलोम व पर्यायवाची"] },
      { name: "पठन", topics: ["गद्य पाठ", "पद्य पाठ", "पठन बोध"] },
      { name: "रचना", topics: ["अनुच्छेद लेखन", "पत्र लेखन", "मुहावरे व लोकोक्तियाँ"] }
    ]
  },
  {
    key: "school-sst",
    name: "Social Science",
    code: "SST",
    color: "#0EA5E9",
    chapters: [
      { name: "History", topics: ["Ancient India", "Medieval India", "Freedom movement"] },
      { name: "Geography", topics: ["Earth & maps", "Landforms & climate", "Resources"] },
      { name: "Civics & economics", topics: ["Government & constitution", "Rights & duties", "Money & markets"] }
    ]
  },
  {
    key: "school-computer",
    name: "Computer Basics",
    code: "COMP",
    color: "#6366F1",
    chapters: [
      { name: "Computer systems", topics: ["Parts of a computer", "Input & output devices", "Files & folders"] },
      { name: "Office tools", topics: ["Typing skills", "Word processing", "Slides & sheets"] },
      { name: "Digital safety", topics: ["Internet basics", "Safe passwords", "Cyber safety rules"] }
    ]
  },

  // ---- School: classes 9–10 --------------------------------------------
  {
    key: "maths10",
    name: "Mathematics (9–10)",
    code: "MATH-10",
    color: "#4338CA",
    chapters: [
      { name: "Algebra", topics: ["Real numbers & polynomials", "Linear equations", "Quadratic equations"] },
      { name: "Geometry & trigonometry", topics: ["Triangles & circles", "Coordinate geometry", "Trigonometric ratios"] },
      { name: "Statistics", topics: ["Mean, median, mode", "Probability", "Surface area & volume"] }
    ]
  },
  {
    key: "science10",
    name: "Science (9–10)",
    code: "SCI-10",
    color: "#059669",
    chapters: [
      { name: "Chemistry", topics: ["Chemical reactions", "Acids, bases & salts", "Metals & non-metals"] },
      { name: "Biology", topics: ["Life processes", "Heredity & evolution", "Environment"] },
      { name: "Physics", topics: ["Motion & force", "Electricity & magnetism", "Light & refraction"] }
    ]
  },
  {
    key: "english10",
    name: "English (9–10)",
    code: "ENG-10",
    color: "#D97706",
    chapters: [
      { name: "Grammar", topics: ["Tenses & voice", "Reported speech", "Clauses & connectors"] },
      { name: "Literature", topics: ["Prose", "Poetry", "Drama"] },
      { name: "Writing skills", topics: ["Formal letters", "Analytical paragraphs", "Notice & report"] }
    ]
  },
  {
    key: "sst10",
    name: "Social Science (9–10)",
    code: "SST-10",
    color: "#0284C7",
    chapters: [
      { name: "History", topics: ["Nationalism in India", "World wars", "Industrialisation"] },
      { name: "Geography", topics: ["Resources & development", "Agriculture", "Water & minerals"] },
      { name: "Civics & economics", topics: ["Democracy & elections", "Federalism", "Development & sectors"] }
    ]
  },
  {
    key: "hindi10",
    name: "Hindi (9–10)",
    code: "HIN-10",
    color: "#DB2777",
    chapters: [
      { name: "व्याकरण", topics: ["काल व वाच्य", "कारक व संधि", "समास व अलंकार"] },
      { name: "साहित्य", topics: ["गद्य खंड", "पद्य खंड", "नाटक"] },
      { name: "रचना", topics: ["निबंध लेखन", "औपचारिक पत्र", "विज्ञापन व सूचना"] }
    ]
  },
  {
    key: "it10",
    name: "Information Technology",
    code: "IT-10",
    color: "#7C3AED",
    chapters: [
      { name: "Digital documents", topics: ["Word processing", "Formatting & styles", "Printing & PDF"] },
      { name: "Spreadsheets", topics: ["Cells & formulas", "Charts", "Data sorting"] },
      { name: "Coding & web", topics: ["HTML basics", "Logic & flowcharts", "Digital citizenship"] }
    ]
  },

  // ---- School: classes 11–12 --------------------------------------------
  {
    key: "physics",
    name: "Physics",
    code: "PHY",
    color: "#2563EB",
    chapters: [
      { name: "Mechanics", topics: ["Laws of motion", "Work, energy & power", "Rotational motion"] },
      { name: "Electricity & magnetism", topics: ["Current electricity", "Moving charges", "Electromagnetic induction"] },
      { name: "Optics & modern physics", topics: ["Ray & wave optics", "Dual nature of light", "Atoms & nuclei"] }
    ]
  },
  {
    key: "chemistry",
    name: "Chemistry",
    code: "CHEM",
    color: "#0891B2",
    chapters: [
      { name: "Physical chemistry", topics: ["Mole concept", "Thermodynamics", "Equilibrium"] },
      { name: "Inorganic chemistry", topics: ["Periodic table", "Chemical bonding", "Coordination compounds"] },
      { name: "Organic chemistry", topics: ["Hydrocarbons", "Alcohols & ethers", "Aldehydes & acids"] }
    ]
  },
  {
    key: "maths11",
    name: "Mathematics (11–12)",
    code: "MATH-11",
    color: "#7C3AED",
    chapters: [
      { name: "Algebra", topics: ["Sets & functions", "Complex numbers", "Matrices & determinants"] },
      { name: "Calculus", topics: ["Limits & continuity", "Differentiation", "Integration"] },
      { name: "Vectors & probability", topics: ["Vectors & 3-D geometry", "Probability", "Linear programming"] }
    ]
  },
  {
    key: "biology",
    name: "Biology",
    code: "BIO",
    color: "#16A34A",
    chapters: [
      { name: "Cell & molecules", topics: ["Cell structure", "Biomolecules", "Cell division"] },
      { name: "Genetics", topics: ["Mendelian genetics", "Molecular basis of inheritance", "Evolution"] },
      { name: "Human physiology", topics: ["Digestion & respiration", "Circulation & excretion", "Reproduction & ecology"] }
    ]
  },
  {
    key: "english11",
    name: "English (11–12)",
    code: "ENG-11",
    color: "#EA580C",
    chapters: [
      { name: "Advanced grammar", topics: ["Sentence structure", "Editing & omission", "Vocabulary & idioms"] },
      { name: "Literature", topics: ["Prose & poetry", "Drama & novel", "Theme & character analysis"] },
      { name: "Writing", topics: ["Letters & applications", "Articles & speeches", "Reports & notices"] }
    ]
  },
  {
    key: "cs11",
    name: "Computer Science",
    code: "CS-11",
    color: "#4F46E5",
    chapters: [
      { name: "Programming", topics: ["Python basics", "Functions & modules", "OOP in Python"] },
      { name: "Data & files", topics: ["Lists, stacks & queues", "File handling", "Databases & SQL"] },
      { name: "Networks & society", topics: ["Computer networks", "Web & protocols", "Cyber ethics"] }
    ]
  },
  {
    key: "accountancy",
    name: "Accountancy",
    code: "ACC",
    color: "#0D9488",
    chapters: [
      { name: "Basic accounting", topics: ["Accounting equation", "Journal & ledger", "Trial balance"] },
      { name: "Financial statements", topics: ["Trading account", "Profit & loss", "Balance sheet"] },
      { name: "Partnership & company", topics: ["Partnership accounts", "Share capital", "Cash flow basics"] }
    ]
  },
  {
    key: "business",
    name: "Business Studies",
    code: "BST",
    color: "#B45309",
    chapters: [
      { name: "Business basics", topics: ["Forms of organisation", "Business environment", "Entrepreneurship"] },
      { name: "Management", topics: ["Principles of management", "Planning & organising", "Staffing & direction"] },
      { name: "Marketing & finance", topics: ["Marketing mix", "Consumer protection", "Financial management"] }
    ]
  },
  {
    key: "economics",
    name: "Economics",
    code: "ECO",
    color: "#9333EA",
    chapters: [
      { name: "Microeconomics", topics: ["Demand & supply", "Elasticity", "Market forms"] },
      { name: "Macroeconomics", topics: ["National income", "Money & banking", "Government budget"] },
      { name: "Indian economy", topics: ["Planning & reforms", "Poverty & employment", "Statistics basics"] }
    ]
  },
  {
    key: "history",
    name: "History",
    code: "HIST",
    color: "#B91C1C",
    chapters: [
      { name: "Ancient & medieval India", topics: ["Indus Valley & Vedic age", "Mauryas & Guptas", "Delhi Sultanate & Mughals"] },
      { name: "Modern India", topics: ["Colonial expansion", "Revolt of 1857", "Freedom struggle"] },
      { name: "World history", topics: ["World wars", "Decolonisation", "Modern world order"] }
    ]
  },
  {
    key: "geography",
    name: "Geography",
    code: "GEO",
    color: "#15803D",
    chapters: [
      { name: "Physical geography", topics: ["Interior of the earth", "Landforms", "Atmosphere & climate"] },
      { name: "Human geography", topics: ["Population", "Settlement & migration", "Economic activities"] },
      { name: "India & maps", topics: ["Drainage & soils", "Monsoon & agriculture", "Map reading"] }
    ]
  },
  {
    key: "polsci",
    name: "Political Science",
    code: "POL",
    color: "#1D4ED8",
    chapters: [
      { name: "Constitution", topics: ["Making of the constitution", "Fundamental rights", "Directive principles"] },
      { name: "Government", topics: ["Parliament", "Executive & judiciary", "Federalism"] },
      { name: "Politics & society", topics: ["Elections & parties", "Political theory", "International organisations"] }
    ]
  }
];

// ---- Courses: class 5–12, streams and graduation degrees ----------------

const SCHOOL_CLASSES = ["5", "6", "7", "8", "9", "10", "11", "12"];

const STREAMS = [
  { key: "pcm", label: "Science — PCM", short: "PCM", detail: "Physics, Chemistry, Maths" },
  { key: "pcb", label: "Science — PCB", short: "PCB", detail: "Physics, Chemistry, Biology" },
  { key: "pcmb", label: "Science — PCMB", short: "PCMB", detail: "Physics, Chemistry, Maths, Biology" },
  { key: "commerce", label: "Commerce", short: "Commerce", detail: "Accounts, Business, Economics" },
  { key: "arts", label: "Arts / Humanities", short: "Arts", detail: "History, Geography, Political Science" }
];

const DEGREES = [
  { key: "btech", label: "B.Tech / B.E." },
  { key: "bca", label: "BCA" },
  { key: "bsc", label: "B.Sc" },
  { key: "bcom", label: "B.Com" },
  { key: "bba", label: "BBA" },
  { key: "ba", label: "B.A." },
  { key: "bpharm", label: "B.Pharm" },
  { key: "other", label: "Other degree" }
];

const JUNIOR_KEYS = ["school-maths", "school-science", "school-english", "school-hindi", "school-sst", "school-computer"];
const MIDDLE_KEYS = ["maths10", "science10", "english10", "sst10", "hindi10", "it10"];

const STREAM_KEYS = {
  pcm: ["physics", "chemistry", "maths11", "english11", "cs11"],
  pcb: ["physics", "chemistry", "biology", "english11"],
  pcmb: ["physics", "chemistry", "maths11", "biology", "english11"],
  commerce: ["accountancy", "business", "economics", "english11"],
  arts: ["history", "geography", "polsci", "english11"]
};

const DEGREE_KEYS = {
  btech: ["dsa", "dbms", "os", "cn", "oop", "toc", "se", "math", "stats"],
  bca: ["dsa", "dbms", "oop", "cn", "se", "math"],
  bsc: ["physics", "chemistry", "biology", "maths11", "english11"],
  bcom: ["accountancy", "business", "economics", "english11"],
  bba: ["business", "economics", "accountancy", "english11"],
  ba: ["history", "geography", "polsci", "english11"],
  bpharm: ["chemistry", "biology", "physics", "english11"],
  other: []
};

const SCHOOL_ONLY_KEYS = new Set([...JUNIOR_KEYS, ...MIDDLE_KEYS]);

function classNumber(className) {
  const n = parseInt(String(className || "").replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function streamMeta(key) {
  return STREAMS.find(s => s.key === key) || null;
}

function degreeLabel(key) {
  const d = DEGREES.find(x => x.key === key);
  return d ? d.label : "";
}

// The subjects a course starts with. "Other degree" starts empty so the
// student picks from the full list themselves.
function courseSubjectKeys(course) {
  const c = course || {};
  if (c.stage === "school") {
    const n = classNumber(c.className);
    if (n >= 11) return [...(STREAM_KEYS[c.stream] || STREAM_KEYS.pcm)];
    if (n >= 9) return [...MIDDLE_KEYS];
    return [...JUNIOR_KEYS];
  }
  const keys = DEGREE_KEYS[c.degree] || [];
  if (keys.length) return [...keys];
  return SUBJECT_CATALOG.filter(s => !SCHOOL_ONLY_KEYS.has(s.key)).map(s => s.key);
}

function courseLabel(profile) {
  if (!profile) return "Student";
  if (profile.stage === "school") {
    const n = classNumber(profile.className);
    const base = n ? "Class " + n : "School";
    const stream = n >= 11 ? streamMeta(profile.stream) : null;
    return stream ? base + " • " + stream.short : base;
  }
  const degree = degreeLabel(profile.degree) || "Graduation";
  const sem = profile.semester ? "Sem " + profile.semester : "";
  return sem ? degree + " • " + sem : degree;
}

function courseInstitutionLabel(profile) {
  return (profile && profile.stage === "school") ? "School name" : "College or university";
}

const CUSTOM_SUBJECT_TEMPLATE = {
  chapters: [
    { name: "Unit 1 — Fundamentals", topics: ["Definitions & basics", "Core terminology", "Standard notation"] },
    { name: "Unit 2 — Core Concepts", topics: ["Key techniques", "Worked examples", "Common pitfalls"] },
    { name: "Unit 3 — Application", topics: ["Problem solving", "Case studies", "Exam-style questions"] }
  ]
};

function findCatalogSubject(key) {
  return SUBJECT_CATALOG.find(s => s.key === key) || null;
}

function subjectInitials(name) {
  return String(name || "?")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(w => w && !/^(and|of|&|the)$/i.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

// ---- Practice questions -------------------------------------------------
// One small, real bank per catalog subject. Quiz pools are built only from
// the subjects the student actually selected.

const QUESTION_BANK = [
  // DSA
  {
    key: "dsa",
    topic: "Two pointers & sliding window",
    difficulty: "Medium",
    question: "In a sorted array, what is the worst-case time complexity of finding a pair that sums to K with the two-pointer technique?",
    options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    correctIndex: 1,
    explanation: "The pointers move inward at most n steps in total, so the scan is linear: O(n) time and O(1) extra space."
  },
  {
    key: "dsa",
    topic: "0/1 Knapsack",
    difficulty: "Hard",
    question: "For 0/1 Knapsack with N items and capacity W, what is the optimal DP time complexity?",
    options: ["O(2^N)", "O(N × W)", "O(N² × W)", "O(W²)"],
    correctIndex: 1,
    explanation: "dp[i][w] has N × W states, and each state resolves in O(1) from the previous row, giving O(N × W) pseudo-polynomial time."
  },
  {
    key: "dsa",
    topic: "Binary search trees",
    difficulty: "Easy",
    question: "Which traversal of a binary search tree visits keys in ascending order?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    correctIndex: 1,
    explanation: "Inorder visits left subtree, node, then right subtree — for a BST that yields sorted ascending keys."
  },
  // DBMS
  {
    key: "dbms",
    topic: "1NF to BCNF",
    difficulty: "Hard",
    question: "A relation is in BCNF when, for every non-trivial functional dependency X → Y:",
    options: ["Y is a prime attribute", "X is a superkey", "X and Y are both non-prime", "X is a candidate key and Y is atomic"],
    correctIndex: 1,
    explanation: "BCNF requires the left side of every non-trivial dependency to be a superkey — stricter than 3NF, which also allows prime attributes on the right."
  },
  {
    key: "dbms",
    topic: "ACID properties",
    difficulty: "Medium",
    question: "Which ACID property guarantees that a transaction is applied completely or not at all?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctIndex: 0,
    explanation: "Atomicity is the all-or-nothing rule: any failure rolls the transaction back to its starting state."
  },
  {
    key: "dbms",
    topic: "Two-phase locking",
    difficulty: "Hard",
    question: "Under Strict 2PL, when are exclusive locks released?",
    options: ["Right after the write completes", "At the end of the growing phase", "Only after commit or abort", "Whenever another transaction asks"],
    correctIndex: 2,
    explanation: "Strict 2PL keeps exclusive locks until commit or abort, which prevents cascading aborts from dirty reads."
  },
  // OS
  {
    key: "os",
    topic: "Deadlock & Banker's algorithm",
    difficulty: "Hard",
    question: "Which of these is NOT one of the four Coffman conditions for deadlock?",
    options: ["Mutual exclusion", "Hold and wait", "Preemption allowed", "Circular wait"],
    correctIndex: 2,
    explanation: "The fourth condition is *no* preemption. If resources can be preempted, deadlock cannot form."
  },
  {
    key: "os",
    topic: "CPU scheduling algorithms",
    difficulty: "Medium",
    question: "Which scheduling algorithm suffers from the convoy effect?",
    options: ["Round Robin", "First-Come First-Served", "Shortest Remaining Time First", "Multi-level feedback queue"],
    correctIndex: 1,
    explanation: "In non-preemptive FCFS a long CPU-bound job blocks every short job behind it, so the queue moves like a convoy."
  },
  {
    key: "os",
    topic: "Virtual memory & thrashing",
    difficulty: "Hard",
    question: "What happens during thrashing?",
    options: ["The CPU idles while the system pages constantly", "The disk becomes read-only", "Deadlock blocks all processes", "Page tables grow without bound"],
    correctIndex: 0,
    explanation: "When the working sets of running processes exceed physical memory, the system spends its time faulting pages in and out and CPU utilisation collapses."
  },
  // CN
  {
    key: "cn",
    topic: "TCP handshake & flow control",
    difficulty: "Medium",
    question: "Which flags are set in the second packet of the TCP three-way handshake?",
    options: ["SYN", "ACK", "SYN + ACK", "FIN + ACK"],
    correctIndex: 2,
    explanation: "The server replies with SYN + ACK: it acknowledges the client's sequence number and advertises its own."
  },
  {
    key: "cn",
    topic: "IPv4 addressing & subnets",
    difficulty: "Hard",
    question: "How many usable host addresses does a /27 subnet provide?",
    options: ["32", "30", "62", "14"],
    correctIndex: 1,
    explanation: "A /27 leaves 5 host bits → 32 addresses, minus the network and broadcast address → 30 usable hosts."
  },
  {
    key: "cn",
    topic: "DNS & HTTP",
    difficulty: "Easy",
    question: "Which protocol translates human-readable domain names into IP addresses?",
    options: ["DHCP", "DNS", "ARP", "SNMP"],
    correctIndex: 1,
    explanation: "DNS is the distributed naming system that resolves names such as example.com to IP addresses."
  },
  // OOP
  {
    key: "oop",
    topic: "Encapsulation",
    difficulty: "Easy",
    question: "Encapsulation primarily means:",
    options: ["Hiding internal state behind a public interface", "Creating many subclasses", "Overloading operators", "Splitting code into files"],
    correctIndex: 0,
    explanation: "Encapsulation bundles data with the methods that operate on it and exposes only a controlled interface."
  },
  {
    key: "oop",
    topic: "Method overriding",
    difficulty: "Medium",
    question: "What is required for a subclass method to override a superclass method?",
    options: ["A different parameter list", "The same signature and a compatible return type", "The private access modifier", "A static declaration"],
    correctIndex: 1,
    explanation: "Overriding replaces inherited behaviour, so the signature must match; a different parameter list would be overloading."
  },
  {
    key: "oop",
    topic: "SOLID principles",
    difficulty: "Medium",
    question: "The 'O' in SOLID stands for:",
    options: ["Object composition", "Open/Closed principle", "Override safety", "Optional dependencies"],
    correctIndex: 1,
    explanation: "Open for extension, closed for modification: add behaviour without editing existing, tested code."
  },
  // TOC
  {
    key: "toc",
    topic: "DFA & NFA",
    difficulty: "Medium",
    question: "Which statement about DFAs and NFAs is true?",
    options: ["NFAs accept a strictly larger class of languages", "DFAs and NFAs accept the same class of languages", "DFAs can have epsilon transitions", "NFAs cannot be simulated by a DFA"],
    correctIndex: 1,
    explanation: "Every NFA can be converted to an equivalent DFA by subset construction, so both recognise exactly the regular languages."
  },
  {
    key: "toc",
    topic: "Pumping lemma",
    difficulty: "Hard",
    question: "The pumping lemma for regular languages is mainly used to:",
    options: ["Prove a language is regular", "Prove a language is not regular", "Convert an NFA to a DFA", "Minimise a DFA"],
    correctIndex: 1,
    explanation: "It is a necessary condition: if a language violates it, the language cannot be regular."
  },
  {
    key: "toc",
    topic: "Halting problem",
    difficulty: "Hard",
    question: "The halting problem is:",
    options: ["Decidable but slow", "Undecidable", "Solvable with more memory", "Regular"],
    correctIndex: 1,
    explanation: "Turing proved no general algorithm can decide, for every program and input, whether it halts."
  },
  // SE
  {
    key: "se",
    topic: "Functional vs non-functional",
    difficulty: "Easy",
    question: "Which of these is a non-functional requirement?",
    options: ["The app sends a receipt email", "The search returns results in under 300 ms", "Users can reset a password", "Admins can export reports"],
    correctIndex: 1,
    explanation: "Performance is a quality attribute — a non-functional requirement — while the others describe behaviour."
  },
  {
    key: "se",
    topic: "Agile & Scrum",
    difficulty: "Medium",
    question: "In Scrum, who owns and orders the product backlog?",
    options: ["Scrum Master", "Product Owner", "Development team", "Stakeholders"],
    correctIndex: 1,
    explanation: "The Product Owner maximises value by ordering the backlog; the Scrum Master coaches process, not priorities."
  },
  {
    key: "se",
    topic: "Black box vs white box",
    difficulty: "Medium",
    question: "White box testing differs from black box testing because it:",
    options: ["Ignores the source code", "Uses knowledge of internal structure", "Is only for UI testing", "Runs only after release"],
    correctIndex: 1,
    explanation: "White box tests exercise internal paths and branches; black box tests only inputs, outputs and behaviour."
  },
  // Math
  {
    key: "math",
    topic: "Propositional logic",
    difficulty: "Easy",
    question: "The statement p → q is logically equivalent to:",
    options: ["p ∧ q", "¬p ∨ q", "¬p ∧ q", "q → p"],
    correctIndex: 1,
    explanation: "An implication is false only when p is true and q is false, which is exactly ¬p ∨ q."
  },
  {
    key: "math",
    topic: "Pigeonhole principle",
    difficulty: "Medium",
    question: "How many people guarantee at least two share a birth month?",
    options: ["12", "13", "24", "365"],
    correctIndex: 1,
    explanation: "There are 12 months, so 13 people force two into the same month by the pigeonhole principle."
  },
  {
    key: "math",
    topic: "Recurrence relations",
    difficulty: "Hard",
    question: "By the Master Theorem, T(n) = 2T(n/2) + O(n) solves to:",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correctIndex: 1,
    explanation: "Here log₂2 = 1 matches f(n) = Θ(n), the balanced case, giving Θ(n log n) — same as merge sort."
  },
  // Stats
  {
    key: "stats",
    topic: "Bayes theorem",
    difficulty: "Medium",
    question: "Bayes theorem lets you compute:",
    options: ["P(A|B) from P(B|A) and priors", "The mean of a sample", "The variance of a uniform variable", "A confidence interval directly"],
    correctIndex: 0,
    explanation: "P(A|B) = P(B|A)·P(A) / P(B) — it reverses the conditioning using prior probabilities."
  },
  {
    key: "stats",
    topic: "Normal distribution",
    difficulty: "Easy",
    question: "In a normal distribution, roughly what share of values lies within one standard deviation of the mean?",
    options: ["50%", "68%", "95%", "99.7%"],
    correctIndex: 1,
    explanation: "The empirical rule gives about 68% within 1σ, 95% within 2σ and 99.7% within 3σ."
  },
  {
    key: "stats",
    topic: "Hypothesis testing",
    difficulty: "Hard",
    question: "A p-value of 0.03 means:",
    options: ["There is a 3% chance the null hypothesis is true", "The observed result is unlikely under the null (3%)", "The effect size is 3%", "The test has 97% power"],
    correctIndex: 1,
    explanation: "The p-value is the probability of data at least this extreme assuming the null hypothesis holds — not the probability that the null is true."
  },

  // ---- School: classes 5–8 ---------------------------------------------
  {
    key: "school-maths",
    topic: "Fractions & decimals",
    difficulty: "Easy",
    question: "What is 3/4 + 1/8?",
    options: ["4/12", "7/8", "1/2", "5/8"],
    correctIndex: 1,
    explanation: "Convert 3/4 to 6/8, then add: 6/8 + 1/8 = 7/8."
  },
  {
    key: "school-maths",
    topic: "HCF, LCM & factors",
    difficulty: "Easy",
    question: "What is the HCF of 12 and 18?",
    options: ["2", "3", "6", "36"],
    correctIndex: 2,
    explanation: "The highest number that divides both 12 and 18 exactly is 6."
  },
  {
    key: "school-maths",
    topic: "Perimeter & area",
    difficulty: "Medium",
    question: "The area of a triangle with base 10 cm and height 6 cm is:",
    options: ["30 cm²", "60 cm²", "16 cm²", "15 cm²"],
    correctIndex: 0,
    explanation: "Area = ½ × base × height = ½ × 10 × 6 = 30 cm²."
  },
  {
    key: "school-science",
    topic: "Plants & photosynthesis",
    difficulty: "Easy",
    question: "Which gas do plants take in during photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1,
    explanation: "Plants use carbon dioxide and water, with sunlight and chlorophyll, to make glucose and release oxygen."
  },
  {
    key: "school-science",
    topic: "Human body systems",
    difficulty: "Easy",
    question: "Which part of a plant absorbs water from the soil?",
    options: ["Leaf", "Stem", "Root", "Flower"],
    correctIndex: 2,
    explanation: "Roots have root hairs that absorb water and minerals from the soil."
  },
  {
    key: "school-science",
    topic: "States of matter",
    difficulty: "Easy",
    question: "Changing from liquid to gas is called:",
    options: ["Melting", "Condensation", "Evaporation", "Freezing"],
    correctIndex: 2,
    explanation: "Evaporation turns a liquid into vapour; condensation is the reverse, gas to liquid."
  },
  {
    key: "school-english",
    topic: "Tenses",
    difficulty: "Easy",
    question: "What is the simple past tense of 'go'?",
    options: ["goed", "went", "gone", "going"],
    correctIndex: 1,
    explanation: "'Go' is irregular: go → went → gone. 'Gone' needs a helper verb, as in 'has gone'."
  },
  {
    key: "school-english",
    topic: "Nouns, pronouns & verbs",
    difficulty: "Easy",
    question: "Which word is the adjective in: 'The tall boy ran fast'?",
    options: ["The", "tall", "ran", "fast"],
    correctIndex: 1,
    explanation: "'Tall' describes the noun 'boy'. 'Ran' is the verb and 'fast' tells us how he ran."
  },
  {
    key: "school-english",
    topic: "Paragraph writing",
    difficulty: "Easy",
    question: "Which sentence uses capital letters correctly?",
    options: ["my friend lives in delhi.", "My friend lives in Delhi.", "My friend lives in delhi.", "my Friend lives in Delhi."],
    correctIndex: 1,
    explanation: "A sentence starts with a capital letter, and proper nouns such as Delhi are capitalised too."
  },
  {
    key: "school-hindi",
    topic: "संज्ञा, सर्वनाम, क्रिया",
    difficulty: "Easy",
    question: "इनमें से संज्ञा शब्द कौन-सा है?",
    options: ["दौड़ना", "लड़का", "सुंदर", "धीरे"],
    correctIndex: 1,
    explanation: "'लड़का' किसी व्यक्ति का नाम है, इसलिए संज्ञा है। दौड़ना क्रिया और सुंदर विशेषण है।"
  },
  {
    key: "school-hindi",
    topic: "विलोम व पर्यायवाची",
    difficulty: "Easy",
    question: "'सूर्य' का पर्यायवाची शब्द है:",
    options: ["चाँद", "रवि", "तारा", "आकाश"],
    correctIndex: 1,
    explanation: "सूर्य के पर्यायवाची हैं — रवि, दिनकर, भानु, आदित्य।"
  },
  {
    key: "school-hindi",
    topic: "विलोम व पर्यायवाची",
    difficulty: "Easy",
    question: "'अंधकार' का विलोम शब्द है:",
    options: ["प्रकाश", "रात", "काला", "छाया"],
    correctIndex: 0,
    explanation: "अंधकार का उल्टा अर्थ प्रकाश है।"
  },
  {
    key: "school-sst",
    topic: "Earth & maps",
    difficulty: "Easy",
    question: "Which is the outermost layer of the Earth?",
    options: ["Crust", "Mantle", "Outer core", "Inner core"],
    correctIndex: 0,
    explanation: "The crust is the thin outer shell we live on; the mantle and cores lie beneath it."
  },
  {
    key: "school-sst",
    topic: "Ancient India",
    difficulty: "Easy",
    question: "Who was the first Prime Minister of India?",
    options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Rajendra Prasad"],
    correctIndex: 1,
    explanation: "Jawaharlal Nehru became the first Prime Minister in 1947; Rajendra Prasad was the first President."
  },
  {
    key: "school-sst",
    topic: "Government & constitution",
    difficulty: "Medium",
    question: "In a democracy, who has the final power to choose the government?",
    options: ["The army", "The voters", "The judges", "The civil servants"],
    correctIndex: 1,
    explanation: "In a democracy the people elect their representatives through voting, and those representatives form the government."
  },
  {
    key: "school-computer",
    topic: "Input & output devices",
    difficulty: "Easy",
    question: "Which of these is an input device?",
    options: ["Monitor", "Keyboard", "Printer", "Speaker"],
    correctIndex: 1,
    explanation: "A keyboard sends data into the computer; monitors, printers and speakers give output."
  },
  {
    key: "school-computer",
    topic: "Files & folders",
    difficulty: "Easy",
    question: "A folder is mainly used to:",
    options: ["Keep related files together", "Delete files automatically", "Print documents", "Connect to the internet"],
    correctIndex: 0,
    explanation: "Folders group related files so you can find and manage them easily."
  },
  {
    key: "school-computer",
    topic: "Safe passwords",
    difficulty: "Easy",
    question: "Which is the strongest password?",
    options: ["123456", "yourname", "Pa55w0rd!2026", "abcdef"],
    correctIndex: 2,
    explanation: "Long passwords mixing capitals, small letters, numbers and symbols are hardest to guess."
  },

  // ---- School: classes 9–10 --------------------------------------------
  {
    key: "maths10",
    topic: "Quadratic equations",
    difficulty: "Medium",
    question: "The roots of x² − 5x + 6 = 0 are:",
    options: ["1 and 6", "2 and 3", "−2 and −3", "5 and 6"],
    correctIndex: 1,
    explanation: "x² − 5x + 6 = (x − 2)(x − 3), so x = 2 or x = 3."
  },
  {
    key: "maths10",
    topic: "Trigonometric ratios",
    difficulty: "Easy",
    question: "What is sin 30°?",
    options: ["1/2", "√3/2", "1", "0"],
    correctIndex: 0,
    explanation: "The standard values give sin 30° = 1/2 and cos 30° = √3/2."
  },
  {
    key: "maths10",
    topic: "Quadratic equations",
    difficulty: "Hard",
    question: "If the discriminant b² − 4ac = 0, the quadratic equation has:",
    options: ["No real roots", "Two equal real roots", "Two distinct real roots", "Infinitely many roots"],
    correctIndex: 1,
    explanation: "A zero discriminant means both roots coincide, giving one repeated real root."
  },
  {
    key: "science10",
    topic: "Acids, bases & salts",
    difficulty: "Easy",
    question: "At 25°C the pH of a neutral solution is:",
    options: ["0", "7", "14", "1"],
    correctIndex: 1,
    explanation: "Pure water is neutral with pH 7; below 7 is acidic and above 7 is basic."
  },
  {
    key: "science10",
    topic: "Chemical reactions",
    difficulty: "Medium",
    question: "Which gas is released when zinc reacts with dilute hydrochloric acid?",
    options: ["Oxygen", "Hydrogen", "Chlorine", "Carbon dioxide"],
    correctIndex: 1,
    explanation: "Zn + 2HCl → ZnCl₂ + H₂ — a metal displacing hydrogen from the acid."
  },
  {
    key: "science10",
    topic: "Electricity & magnetism",
    difficulty: "Medium",
    question: "According to Ohm's law, V equals:",
    options: ["I / R", "I × R", "R / I", "I²R"],
    correctIndex: 1,
    explanation: "V = IR. The I²R expression is electrical power, not voltage."
  },
  {
    key: "english10",
    topic: "Tenses & voice",
    difficulty: "Medium",
    question: "Choose the correct passive voice of 'She writes a letter.'",
    options: ["A letter is written by her.", "A letter was written by her.", "A letter is wrote by her.", "A letter written by her."],
    correctIndex: 0,
    explanation: "Simple present active becomes 'is/are + past participle': A letter is written by her."
  },
  {
    key: "english10",
    topic: "Poetry",
    difficulty: "Medium",
    question: "'The wind whispered through the trees' uses which figure of speech?",
    options: ["Simile", "Metaphor", "Personification", "Alliteration"],
    correctIndex: 2,
    explanation: "The wind is given the human ability to whisper, which is personification."
  },
  {
    key: "english10",
    topic: "Reported speech",
    difficulty: "Easy",
    question: "Which spelling is correct?",
    options: ["Recieve", "Receive", "Receeve", "Receve"],
    correctIndex: 1,
    explanation: "Remember the rule: i before e except after c — receive."
  },
  {
    key: "sst10",
    topic: "Nationalism in India",
    difficulty: "Medium",
    question: "The Dandi March of 1930 launched which movement?",
    options: ["Quit India Movement", "Civil Disobedience Movement", "Non-Cooperation Movement", "Khilafat Movement"],
    correctIndex: 1,
    explanation: "Gandhi walked to Dandi to make salt, starting the Civil Disobedience Movement in 1930."
  },
  {
    key: "sst10",
    topic: "Resources & development",
    difficulty: "Medium",
    question: "Which soil is considered best for growing cotton?",
    options: ["Alluvial soil", "Black soil", "Red soil", "Laterite soil"],
    correctIndex: 1,
    explanation: "Black (regur) soil retains moisture and is rich in minerals, which suits cotton."
  },
  {
    key: "sst10",
    topic: "Democracy & elections",
    difficulty: "Easy",
    question: "Who is the constitutional head of the Indian State?",
    options: ["The President", "The Prime Minister", "The Chief Justice", "The Speaker"],
    correctIndex: 0,
    explanation: "The President is the head of state; the Prime Minister heads the government."
  },
  {
    key: "hindi10",
    topic: "काल व वाच्य",
    difficulty: "Medium",
    question: "क्रिया का वह रूप जो कार्य का समय बताता है, कहलाता है:",
    options: ["लिंग", "वचन", "काल", "कारक"],
    correctIndex: 2,
    explanation: "काल तीन प्रकार का होता है — भूत, वर्तमान और भविष्य।"
  },
  {
    key: "hindi10",
    topic: "मुहावरे व लोकोक्तियाँ",
    difficulty: "Easy",
    question: "मुहावरे 'आँख का तारा' का अर्थ है:",
    options: ["बहुत प्रिय", "बहुत दूर", "बहुत बड़ा", "बहुत सस्ता"],
    correctIndex: 0,
    explanation: "'आँख का तारा' का अर्थ है अत्यंत प्रिय व्यक्ति।"
  },
  {
    key: "hindi10",
    topic: "कारक व संधि",
    difficulty: "Hard",
    question: "'विद्या + अर्थी' की संधि से बनता है:",
    options: ["विद्यार्थी", "विद्याअर्थी", "विद्यार्थि", "विद्यार्थ"],
    correctIndex: 0,
    explanation: "आ + अ = आ (दीर्घ संधि), इसलिए विद्या + अर्थी = विद्यार्थी।"
  },
  {
    key: "it10",
    topic: "Cells & formulas",
    difficulty: "Easy",
    question: "In a spreadsheet, which function adds a range of cells?",
    options: ["SUM", "COUNT", "AVERAGE", "TEXT"],
    correctIndex: 0,
    explanation: "=SUM(A1:A10) adds every number in the range."
  },
  {
    key: "it10",
    topic: "Word processing",
    difficulty: "Easy",
    question: "Which file extension belongs to a word processor document?",
    options: [".xlsx", ".docx", ".pptx", ".jpg"],
    correctIndex: 1,
    explanation: ".docx is a word document, .xlsx a spreadsheet and .pptx a presentation."
  },
  {
    key: "it10",
    topic: "HTML basics",
    difficulty: "Medium",
    question: "HTML is used mainly to:",
    options: ["Style web pages", "Structure web pages", "Store passwords", "Route network traffic"],
    correctIndex: 1,
    explanation: "HTML defines structure and content; CSS handles styling and JavaScript adds behaviour."
  },

  // ---- School: classes 11–12 --------------------------------------------
  {
    key: "physics",
    topic: "Laws of motion",
    difficulty: "Easy",
    question: "The SI unit of force is:",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    correctIndex: 1,
    explanation: "1 newton = 1 kg·m/s². Joule is energy, watt is power, pascal is pressure."
  },
  {
    key: "physics",
    topic: "Rotational motion",
    difficulty: "Medium",
    question: "A body in uniform circular motion has:",
    options: ["Constant velocity", "Constant speed but changing velocity", "Zero acceleration", "Constant acceleration along its path"],
    correctIndex: 1,
    explanation: "Speed stays the same but the direction changes continuously, so velocity changes and there is centripetal acceleration."
  },
  {
    key: "physics",
    topic: "Ray & wave optics",
    difficulty: "Medium",
    question: "Which lens is used to correct myopia (short-sightedness)?",
    options: ["Convex", "Concave", "Cylindrical", "Plane"],
    correctIndex: 1,
    explanation: "A concave (diverging) lens shifts the image back onto the retina of a myopic eye."
  },
  {
    key: "chemistry",
    topic: "Periodic table",
    difficulty: "Easy",
    question: "How many electrons does a neutral carbon atom have?",
    options: ["4", "6", "12", "14"],
    correctIndex: 1,
    explanation: "Carbon's atomic number is 6, so a neutral atom has 6 electrons."
  },
  {
    key: "chemistry",
    topic: "Hydrocarbons",
    difficulty: "Medium",
    question: "Which of these is an aromatic compound?",
    options: ["Benzene", "Ethane", "Propene", "Methanol"],
    correctIndex: 0,
    explanation: "Benzene's delocalised six-electron ring makes it aromatic; the others are aliphatic."
  },
  {
    key: "chemistry",
    topic: "Equilibrium",
    difficulty: "Hard",
    question: "Increasing pressure on a gaseous equilibrium shifts it towards:",
    options: ["The side with more gas molecules", "The side with fewer gas molecules", "No shift at all", "Always the products"],
    correctIndex: 1,
    explanation: "Le Chatelier's principle: higher pressure favours the side with fewer gaseous moles."
  },
  {
    key: "maths11",
    topic: "Differentiation",
    difficulty: "Easy",
    question: "What is d/dx (sin x)?",
    options: ["cos x", "−cos x", "sin x", "−sin x"],
    correctIndex: 0,
    explanation: "The derivative of sin x is cos x, while d/dx (cos x) = −sin x."
  },
  {
    key: "maths11",
    topic: "Sets & functions",
    difficulty: "Medium",
    question: "If A is a subset of B, then A ∩ B equals:",
    options: ["A", "B", "φ", "A ∪ B"],
    correctIndex: 0,
    explanation: "Every element of A is already in B, so the overlap of A and B is exactly A."
  },
  {
    key: "maths11",
    topic: "Probability",
    difficulty: "Easy",
    question: "In how many ways can 3 distinct books be arranged in a row?",
    options: ["3", "6", "9", "27"],
    correctIndex: 1,
    explanation: "3! = 3 × 2 × 1 = 6 arrangements."
  },
  {
    key: "biology",
    topic: "Cell structure",
    difficulty: "Easy",
    question: "Which organelle is called the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctIndex: 1,
    explanation: "Mitochondria produce ATP through cellular respiration, powering the cell."
  },
  {
    key: "biology",
    topic: "Molecular basis of inheritance",
    difficulty: "Medium",
    question: "DNA replication is described as:",
    options: ["Conservative", "Semi-conservative", "Dispersive", "Random"],
    correctIndex: 1,
    explanation: "Each new DNA molecule keeps one parental strand and one new strand."
  },
  {
    key: "biology",
    topic: "Circulation & excretion",
    difficulty: "Easy",
    question: "Which blood group is the universal donor?",
    options: ["A", "B", "AB", "O"],
    correctIndex: 3,
    explanation: "O-negative red cells carry no A, B or Rh antigens, so they can be given to anyone."
  },
  {
    key: "english11",
    topic: "Sentence structure",
    difficulty: "Medium",
    question: "Choose the correct verb: 'Neither of the boys ___ ready.'",
    options: ["is", "are", "were", "have"],
    correctIndex: 0,
    explanation: "'Neither' is singular, so it takes 'is' even though 'boys' is plural."
  },
  {
    key: "english11",
    topic: "Vocabulary & idioms",
    difficulty: "Medium",
    question: "The word 'ubiquitous' means:",
    options: ["Rare", "Present everywhere", "Hidden", "Temporary"],
    correctIndex: 1,
    explanation: "Ubiquitous describes something that seems to be everywhere at once."
  },
  {
    key: "english11",
    topic: "Theme & character analysis",
    difficulty: "Medium",
    question: "In 'I left because it rained', the subordinate clause is:",
    options: ["I left", "because it rained", "left because", "none"],
    correctIndex: 1,
    explanation: "'Because it rained' cannot stand alone and depends on the main clause 'I left'."
  },
  {
    key: "cs11",
    topic: "Python basics",
    difficulty: "Easy",
    question: "What does len('study') return in Python?",
    options: ["4", "5", "6", "Error"],
    correctIndex: 1,
    explanation: "len counts the characters: s-t-u-d-y is 5."
  },
  {
    key: "cs11",
    topic: "Functions & modules",
    difficulty: "Medium",
    question: "Which Python data type is immutable?",
    options: ["list", "dict", "set", "tuple"],
    correctIndex: 3,
    explanation: "A tuple cannot be changed after creation; lists, dicts and sets can."
  },
  {
    key: "cs11",
    topic: "Databases & SQL",
    difficulty: "Medium",
    question: "Which SQL clause filters groups after GROUP BY?",
    options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
    correctIndex: 1,
    explanation: "WHERE filters rows before grouping; HAVING filters the grouped result."
  },
  {
    key: "accountancy",
    topic: "Accounting equation",
    difficulty: "Easy",
    question: "The accounting equation is:",
    options: ["Assets = Capital − Liabilities", "Assets = Liabilities + Capital", "Capital = Assets + Liabilities", "Liabilities = Assets + Capital"],
    correctIndex: 1,
    explanation: "Everything a business owns (assets) is financed by outsiders (liabilities) and owners (capital)."
  },
  {
    key: "accountancy",
    topic: "Journal & ledger",
    difficulty: "Easy",
    question: "Which book records transactions first, in date order?",
    options: ["Ledger", "Journal", "Trial balance", "Balance sheet"],
    correctIndex: 1,
    explanation: "The journal is the book of original entry; the ledger is posted from it."
  },
  {
    key: "accountancy",
    topic: "Trading account",
    difficulty: "Medium",
    question: "Gross profit equals:",
    options: ["Sales − Cost of goods sold", "Sales − all expenses", "Net profit + sales", "Capital − drawings"],
    correctIndex: 0,
    explanation: "Gross profit is sales revenue minus the direct cost of the goods sold."
  },
  {
    key: "business",
    topic: "Forms of organisation",
    difficulty: "Easy",
    question: "Which form of organisation gives its owners limited liability?",
    options: ["Sole proprietorship", "Partnership", "Company", "Joint Hindu family business"],
    correctIndex: 2,
    explanation: "A company is a separate legal entity, so shareholders risk only their invested capital."
  },
  {
    key: "business",
    topic: "Marketing mix",
    difficulty: "Easy",
    question: "The classic marketing mix has how many Ps?",
    options: ["3", "4", "5", "7"],
    correctIndex: 1,
    explanation: "Product, Price, Place and Promotion make the traditional 4 Ps."
  },
  {
    key: "business",
    topic: "Principles of management",
    difficulty: "Medium",
    question: "The principle of division of work was popularised by:",
    options: ["F.W. Taylor", "Henri Fayol", "Peter Drucker", "Abraham Maslow"],
    correctIndex: 1,
    explanation: "Fayol listed division of work among his 14 principles of administration."
  },
  {
    key: "economics",
    topic: "Demand & supply",
    difficulty: "Easy",
    question: "According to the law of demand, when price rises, quantity demanded:",
    options: ["Rises", "Falls", "Stays the same", "Becomes infinite"],
    correctIndex: 1,
    explanation: "Price and quantity demanded move in opposite directions, other things unchanged."
  },
  {
    key: "economics",
    topic: "National income",
    difficulty: "Easy",
    question: "GDP stands for:",
    options: ["Gross Domestic Product", "General Development Plan", "Gross Demand Price", "Global Domestic Price"],
    correctIndex: 0,
    explanation: "GDP measures the value of all final goods and services produced within a country in a year."
  },
  {
    key: "economics",
    topic: "Poverty & employment",
    difficulty: "Medium",
    question: "Which of these is a primary sector activity?",
    options: ["Banking", "Farming", "Manufacturing", "Transport"],
    correctIndex: 1,
    explanation: "Primary activities use natural resources directly — farming, mining, fishing."
  },
  {
    key: "history",
    topic: "Freedom struggle",
    difficulty: "Easy",
    question: "The Indian National Congress was founded in:",
    options: ["1857", "1885", "1905", "1919"],
    correctIndex: 1,
    explanation: "The INC was founded in 1885; 1905 was the Partition of Bengal and 1919 the Jallianwala Bagh massacre."
  },
  {
    key: "history",
    topic: "Freedom struggle",
    difficulty: "Easy",
    question: "Who led the Salt March (Dandi March) in 1930?",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Sardar Patel", "Bal Gangadhar Tilak"],
    correctIndex: 1,
    explanation: "Gandhi marched 240 miles to Dandi to break the salt law, starting Civil Disobedience."
  },
  {
    key: "history",
    topic: "Indus Valley & Vedic age",
    difficulty: "Easy",
    question: "The Harappan civilisation is also known as:",
    options: ["Vedic civilisation", "Indus Valley civilisation", "Mauryan empire", "Gupta empire"],
    correctIndex: 1,
    explanation: "Its cities grew along the Indus and its tributaries, hence 'Indus Valley'."
  },
  {
    key: "geography",
    topic: "Landforms",
    difficulty: "Medium",
    question: "The Himalayas were formed mainly by:",
    options: ["River erosion", "Collision of tectonic plates", "Volcanic eruptions", "Glacial deposits"],
    correctIndex: 1,
    explanation: "The Indian plate pushing into the Eurasian plate folded the crust upwards."
  },
  {
    key: "geography",
    topic: "Map reading",
    difficulty: "Easy",
    question: "Which line divides the Earth into Northern and Southern hemispheres?",
    options: ["Equator", "Prime Meridian", "Tropic of Cancer", "Arctic Circle"],
    correctIndex: 0,
    explanation: "The Equator is 0° latitude; the Prime Meridian is 0° longitude."
  },
  {
    key: "geography",
    topic: "Monsoon & agriculture",
    difficulty: "Medium",
    question: "The Indian monsoon is mainly caused by:",
    options: ["Ocean currents", "Seasonal reversal of winds", "Earthquakes", "Tides"],
    correctIndex: 1,
    explanation: "Differential heating of land and sea reverses the wind direction seasonally, bringing the monsoon."
  },
  {
    key: "polsci",
    topic: "Fundamental rights",
    difficulty: "Medium",
    question: "Fundamental Rights are contained in which Part of the Indian Constitution?",
    options: ["Part I", "Part III", "Part IV", "Part V"],
    correctIndex: 1,
    explanation: "Part III (Articles 12–35) lists Fundamental Rights; Part IV holds Directive Principles."
  },
  {
    key: "polsci",
    topic: "Executive & judiciary",
    difficulty: "Medium",
    question: "Who appoints the Chief Justice of India?",
    options: ["The President", "The Prime Minister", "Parliament", "The Supreme Court collegium alone"],
    correctIndex: 0,
    explanation: "The President appoints the Chief Justice, conventionally following the collegium's advice."
  },
  {
    key: "polsci",
    topic: "Elections & parties",
    difficulty: "Easy",
    question: "A system dominated by two major parties is called:",
    options: ["Multi-party system", "Bi-party system", "Single-party system", "Coalition system"],
    correctIndex: 1,
    explanation: "A bi-party system has two parties that seriously compete for power."
  }
];

function questionsForSubjectKeys(keys) {
  const allowed = new Set(keys || []);
  return QUESTION_BANK
    .filter(q => allowed.has(q.key))
    .map((q, i) => ({ ...q, id: "q-" + q.key + "-" + i }));
}
