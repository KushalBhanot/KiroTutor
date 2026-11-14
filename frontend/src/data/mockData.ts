import { Lecture, StudyKit, Question, ConfusionMapData } from '../types';

// Mock Lecture Data
export const mockLecture: Lecture = {
  id: 'lecture-001',
  title: 'MIT 6.006 - Introduction to Algorithms: Algorithmic Thinking & Sorting',
  course_id: 'course-001',
  professor_id: 'prof-001',
  s3_url: 's3://kirotutor/lectures/lecture-001/video.mp4',
  transcript_s3_url: 's3://kirotutor/transcripts/lecture-001/transcript.json',
  transcription_status: 'completed',
  duration_seconds: 2700, // 45 minutes
  created_at: new Date().toISOString(),
};

// Mock Study Kit
export const mockStudyKit: StudyKit = {
  id: 'kit-001',
  lecture_id: 'lecture-001',
  summary: `This lecture introduces fundamental algorithmic thinking and covers sorting algorithms in depth. Professor Leiserson begins by explaining the importance of algorithmic efficiency and introduces Big-O notation for analyzing time complexity. The lecture then dives into comparison-based sorting algorithms, focusing particularly on Merge Sort and its divide-and-conquer approach. Key concepts include the recursion tree analysis, proving the O(n log n) time complexity, and understanding why this is optimal for comparison-based sorting. The lecture also touches on when simpler O(n²) algorithms like Insertion Sort might be preferable for small datasets.`,
  takeaways: [
    'Big-O notation describes algorithmic efficiency by focusing on growth rate as input size increases',
    'Merge Sort achieves O(n log n) time complexity through divide-and-conquer strategy',
    'The recursion tree for Merge Sort has log n levels, each doing O(n) work',
    'Comparison-based sorting has a theoretical lower bound of Ω(n log n)',
    'Space complexity matters - Merge Sort uses O(n) extra space',
    'In-place algorithms like Heap Sort can achieve O(n log n) with O(1) space',
    'For small arrays (n < 10), simple algorithms like Insertion Sort can be faster due to lower constants',
  ],
  questions: [
    {
      question: 'What is the time complexity of Merge Sort and why?',
      answer: 'O(n log n) because we divide the array log n times and merge n elements at each level',
      type: 'short_answer',
    },
    {
      question: 'Which of the following is true about Merge Sort?',
      answer: 'B) It uses O(n) extra space',
      type: 'multiple_choice',
      options: [
        'A) It sorts in-place',
        'B) It uses O(n) extra space',
        'C) It has O(n²) worst case',
        'D) It is not stable',
      ],
    },
    {
      question: 'True or False: All comparison-based sorting algorithms must take at least Ω(n log n) time in the worst case.',
      answer: 'True',
      type: 'true_false',
    },
    {
      question: 'Explain the divide-and-conquer strategy used in Merge Sort.',
      answer: 'Recursively split array in half until single elements, then merge sorted subarrays back together',
      type: 'short_answer',
    },
    {
      question: 'What is the space complexity of Merge Sort?',
      answer: 'O(n) for the temporary arrays used during merging',
      type: 'short_answer',
    },
    {
      question: 'When might you use Insertion Sort instead of Merge Sort?',
      answer: 'For very small arrays (n < 10) where the lower constant factors of Insertion Sort dominate',
      type: 'short_answer',
    },
    {
      question: 'How many levels does the recursion tree have in Merge Sort?',
      answer: 'C) log n levels',
      type: 'multiple_choice',
      options: ['A) n levels', 'B) n² levels', 'C) log n levels', 'D) n log n levels'],
    },
    {
      question: 'What work is done at each level of the Merge Sort recursion tree?',
      answer: 'O(n) work merging all subarrays at that level',
      type: 'short_answer',
    },
  ],
  glossary: {
    'Big-O Notation': 'Mathematical notation describing the upper bound of an algorithm\'s growth rate',
    'Divide-and-Conquer': 'Algorithmic paradigm that breaks problems into smaller subproblems, solves them recursively, then combines results',
    'Merge Sort': 'Efficient, stable, comparison-based sorting algorithm with O(n log n) time complexity',
    'Time Complexity': 'Measure of computational time as a function of input size',
    'Space Complexity': 'Amount of memory an algorithm uses relative to input size',
    'In-Place Algorithm': 'Algorithm that uses O(1) extra space beyond the input',
    'Stable Sort': 'Sorting algorithm that preserves the relative order of equal elements',
    'Recursion Tree': 'Visualization of recursive calls showing work done at each level',
    'Asymptotic Analysis': 'Study of algorithm behavior as input size approaches infinity',
    'Lower Bound': 'Theoretical minimum time required for any algorithm solving a problem',
  },
  generated_at: new Date().toISOString(),
};

// Mock Questions with timestamp distribution creating confusion peaks
export const mockQuestions: Question[] = [
  // Introduction (0-5 min) - Low confusion
  {
    id: 'q001',
    lecture_id: 'lecture-001',
    student_id: 'student-001',
    question_text: 'What topics will be covered in this lecture?',
    answer_text: 'We will cover algorithmic thinking, Big-O notation, and sorting algorithms including Merge Sort.',
    timestamp_seconds: 120,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q002',
    lecture_id: 'lecture-001',
    student_id: 'student-002',
    question_text: 'Why is algorithm efficiency important?',
    answer_text: 'Efficient algorithms can make the difference between solving problems in seconds vs. hours or days, especially with large datasets.',
    timestamp_seconds: 180,
    created_at: new Date().toISOString(),
  },
  
  // CONFUSION PEAK #1: Merge Sort Time Complexity (12-18 min)
  {
    id: 'q003',
    lecture_id: 'lecture-001',
    student_id: 'student-003',
    question_text: 'What is the time complexity of Merge Sort?',
    answer_text: 'O(n log n) in all cases - best, average, and worst case.',
    timestamp_seconds: 750,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q004',
    lecture_id: 'lecture-001',
    student_id: 'student-004',
    question_text: 'Why is it O(n log n) and not O(n²)?',
    answer_text: 'Because we divide the problem in half log n times, and do O(n) work at each level of the recursion tree.',
    timestamp_seconds: 780,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q005',
    lecture_id: 'lecture-001',
    student_id: 'student-005',
    question_text: 'Can someone explain the recursion tree for Merge Sort?',
    answer_text: 'The recursion tree shows how we split the array. The root is the full array, each level splits in half, creating log n levels total.',
    timestamp_seconds: 810,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q006',
    lecture_id: 'lecture-001',
    student_id: 'student-006',
    question_text: 'How do we calculate the depth of the recursion?',
    answer_text: 'The depth is log₂ n because we divide by 2 at each level until we reach single elements.',
    timestamp_seconds: 840,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q007',
    lecture_id: 'lecture-001',
    student_id: 'student-007',
    question_text: 'Is Merge Sort always better than Insertion Sort?',
    answer_text: 'Not always - for very small arrays (n < 10), Insertion Sort can be faster due to lower constant factors.',
    timestamp_seconds: 870,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q008',
    lecture_id: 'lecture-001',
    student_id: 'student-008',
    question_text: 'What is the space complexity of Merge Sort?',
    answer_text: 'O(n) because we need temporary arrays to merge the subarrays.',
    timestamp_seconds: 900,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q009',
    lecture_id: 'lecture-001',
    student_id: 'student-009',
    question_text: 'Why does Merge Sort use extra space?',
    answer_text: 'During the merge step, we need auxiliary arrays to hold the sorted subarrays before copying back.',
    timestamp_seconds: 930,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q010',
    lecture_id: 'lecture-001',
    student_id: 'student-010',
    question_text: 'Can Merge Sort be done in-place?',
    answer_text: 'There are in-place variants but they are complex and lose the simplicity that makes Merge Sort elegant.',
    timestamp_seconds: 960,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q011',
    lecture_id: 'lecture-001',
    student_id: 'student-011',
    question_text: 'How much work is done at each level of the recursion tree?',
    answer_text: 'O(n) work total across all nodes at each level, because we merge n total elements.',
    timestamp_seconds: 990,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q012',
    lecture_id: 'lecture-001',
    student_id: 'student-012',
    question_text: 'What does "divide and conquer" mean?',
    answer_text: 'Break the problem into smaller subproblems, solve them recursively, then combine the solutions.',
    timestamp_seconds: 1020,
    created_at: new Date().toISOString(),
  },
  
  // Transition period (18-28 min) - Lower confusion
  {
    id: 'q013',
    lecture_id: 'lecture-001',
    student_id: 'student-013',
    question_text: 'Is Merge Sort stable?',
    answer_text: 'Yes, it preserves the relative order of equal elements.',
    timestamp_seconds: 1320,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q014',
    lecture_id: 'lecture-001',
    student_id: 'student-014',
    question_text: 'What does stable sorting mean?',
    answer_text: 'A stable sort maintains the relative order of records with equal keys.',
    timestamp_seconds: 1380,
    created_at: new Date().toISOString(),
  },
  
  // CONFUSION PEAK #2: Heaps and Priority Queues (28-35 min)
  {
    id: 'q015',
    lecture_id: 'lecture-001',
    student_id: 'student-015',
    question_text: 'What is the difference between a heap and a binary search tree?',
    answer_text: 'A heap maintains parent > children (max-heap) or parent < children (min-heap), while BST maintains left < parent < right.',
    timestamp_seconds: 1725,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q016',
    lecture_id: 'lecture-001',
    student_id: 'student-016',
    question_text: 'How does heapify work?',
    answer_text: 'Heapify adjusts a node to maintain heap property by comparing with children and swapping if necessary.',
    timestamp_seconds: 1755,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q017',
    lecture_id: 'lecture-001',
    student_id: 'student-017',
    question_text: 'Why is heap insertion O(log n)?',
    answer_text: 'Because we insert at the bottom and bubble up at most log n levels (the height of the tree).',
    timestamp_seconds: 1785,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q018',
    lecture_id: 'lecture-001',
    student_id: 'student-018',
    question_text: 'Can you build a heap in linear time?',
    answer_text: 'Yes! Using bottom-up heapify, you can build a heap in O(n) time instead of O(n log n).',
    timestamp_seconds: 1815,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q019',
    lecture_id: 'lecture-001',
    student_id: 'student-019',
    question_text: 'How do priority queues use heaps?',
    answer_text: 'Priority queues use heaps to efficiently maintain and extract the highest (or lowest) priority element.',
    timestamp_seconds: 1845,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q020',
    lecture_id: 'lecture-001',
    student_id: 'student-020',
    question_text: 'What is the difference between min-heap and max-heap?',
    answer_text: 'Min-heap has smallest element at root (parent ≤ children), max-heap has largest (parent ≥ children).',
    timestamp_seconds: 1875,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q021',
    lecture_id: 'lecture-001',
    student_id: 'student-021',
    question_text: 'When would I use a heap in real applications?',
    answer_text: 'Heaps are used in priority queues, scheduling algorithms, Dijkstra\'s shortest path, and heap sort.',
    timestamp_seconds: 1905,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q022',
    lecture_id: 'lecture-001',
    student_id: 'student-022',
    question_text: 'What is heap sort\'s time complexity?',
    answer_text: 'O(n log n) - we build the heap in O(n) then extract max n times at O(log n) each.',
    timestamp_seconds: 1935,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q023',
    lecture_id: 'lecture-001',
    student_id: 'student-023',
    question_text: 'Is heap sort better than merge sort?',
    answer_text: 'Heap sort is in-place (O(1) space) but typically slower in practice due to worse cache performance.',
    timestamp_seconds: 1965,
    created_at: new Date().toISOString(),
  },
  
  // Summary (40-45 min) - Medium confusion
  {
    id: 'q024',
    lecture_id: 'lecture-001',
    student_id: 'student-024',
    question_text: 'What are the key takeaways from this lecture?',
    answer_text: 'Understand time complexity, know merge sort achieves O(n log n), and recognize when to use different sorting algorithms.',
    timestamp_seconds: 2430,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q025',
    lecture_id: 'lecture-001',
    student_id: 'student-025',
    question_text: 'Will we cover more sorting algorithms?',
    answer_text: 'Yes, future lectures will cover Quick Sort, Radix Sort, and counting-based sorts.',
    timestamp_seconds: 2490,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q026',
    lecture_id: 'lecture-001',
    student_id: 'student-026',
    question_text: 'How should I prepare for the problem set?',
    answer_text: 'Practice implementing merge sort, analyze complexity of given algorithms, and solve the sorting problems.',
    timestamp_seconds: 2550,
    created_at: new Date().toISOString(),
  },
];

// Generate Confusion Map Data
export const mockConfusionMap: ConfusionMapData = {
  lecture_id: 'lecture-001',
  lecture_title: mockLecture.title,
  duration_seconds: 2700,
  heatmap: generateHeatmapBuckets(mockQuestions, 2700, 180),
  total_questions: mockQuestions.length,
};

// Live questions asked in this browser session feed the professor's Confusion Map
const LIVE_KEY = 'kirotutor_live_questions';

export function getLiveQuestions(): Question[] {
  try {
    return JSON.parse(localStorage.getItem(LIVE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addLiveQuestion(questionText: string, answerText: string, timestampSeconds: number) {
  const live = getLiveQuestions();
  live.unshift({
    id: `live-${Date.now()}`,
    lecture_id: mockLecture.id,
    student_id: 'student-001',
    question_text: questionText,
    answer_text: answerText,
    timestamp_seconds: timestampSeconds,
    created_at: new Date().toISOString(),
  });
  try {
    localStorage.setItem(LIVE_KEY, JSON.stringify(live));
  } catch {
    // storage unavailable, live feed is best-effort
  }
}

export function buildConfusionMap(): ConfusionMapData {
  const all = [...getLiveQuestions(), ...mockQuestions];
  return {
    ...mockConfusionMap,
    heatmap: generateHeatmapBuckets(all, 2700, 180),
    total_questions: all.length,
  };
}

function generateHeatmapBuckets(
  questions: Question[],
  duration: number,
  bucketSize: number
) {
  const numBuckets = Math.ceil(duration / bucketSize);
  const buckets = new Map<number, Question[]>();

  // Initialize buckets
  for (let i = 0; i < numBuckets; i++) {
    buckets.set(i, []);
  }

  // Distribute questions
  questions.forEach((q) => {
    const bucketIndex = Math.floor(q.timestamp_seconds / bucketSize);
    const bucket = buckets.get(bucketIndex) || [];
    bucket.push(q);
    buckets.set(bucketIndex, bucket);
  });

  // Find max for normalization
  let maxQuestions = 0;
  buckets.forEach((qs) => {
    if (qs.length > maxQuestions) maxQuestions = qs.length;
  });

  // Build heatmap
  const heatmap = [];
  for (let i = 0; i < numBuckets; i++) {
    const questions = buckets.get(i) || [];
    const startTime = i * bucketSize;
    const endTime = Math.min(startTime + bucketSize, duration);
    const intensity = maxQuestions > 0 ? questions.length / maxQuestions : 0;

    heatmap.push({
      start_time: startTime,
      end_time: endTime,
      question_count: questions.length,
      intensity,
      sample_questions: questions.slice(0, 3).map((q) => ({
        question_text: q.question_text,
        timestamp_seconds: q.timestamp_seconds,
      })),
    });
  }

  return heatmap;
}

export const mockRecapScript = `Good morning, everyone! Before we dive into today's material on Quick Sort, I want to take about 5 minutes to revisit two concepts from our last lecture where many of you had questions.

**First, let's clarify Merge Sort's time complexity.** I know the O(n log n) analysis was confusing for some. Here's a simpler way to think about it: imagine you're organizing a messy deck of cards. Merge Sort says: keep splitting the deck in half until you have individual cards. How many times do you split? That's log n times - because splitting in half repeatedly gives you logarithmic depth.

Now at each level of splitting, you're handling ALL the cards - that's n cards total. So: log n levels, n work per level = n log n total work. The key insight is that even though we're doing work at every level, we're only going log n levels deep, not n levels deep like a bad algorithm would.

**Second, heaps versus binary search trees.** Several of you asked about this distinction around the 28-minute mark. Here's the clearest way I can put it:

A Binary Search Tree is about *searching* - it maintains order so left < parent < right at every node. This makes finding elements fast.

A Heap is about *priority* - it only cares that parents are bigger (or smaller) than children. It doesn't maintain full ordering, which makes it faster to build and update.

Think of it this way: BST is like a library catalog (optimized for finding specific books), while a heap is like a priority queue at a hospital (optimized for always getting the most urgent patient, but you can't quickly find a specific patient).

The reason heaps are O(n) to build is beautiful: when you heapify bottom-up, most nodes don't travel far. Only the top few nodes might bubble down log n levels, and there are only a few of them. The math works out to linear time!

Alright, with those clarifications, let's move into Quick Sort and see how choosing a good pivot gives us similar O(n log n) average-case performance. Any quick questions before we begin?`;