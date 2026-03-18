// ============================================================
// SKILL PASSPORT — Hardcoded Question Bank
// ============================================================

export interface CodingQuestion {
  id: string
  type: 'coding'
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: 'java' | 'python'
  starterCode: string
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[]
  topic: string
}

export interface McqQuestion {
  id: string
  type: 'mcq'
  question: string
  options: string[]
  correctAnswer: number   // 0-indexed
  explanation: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type AssessmentQuestion = CodingQuestion | McqQuestion

// ── Java Coding Questions ──────────────────────────────────────────────────

export const JAVA_QUESTIONS: CodingQuestion[] = [
  {
    id: 'java-1',
    type: 'coding',
    title: 'Reverse a String',
    description: `Write a Java program that reads a string from standard input and prints the reversed string.

## Example
**Input:** \`hello\`
**Output:** \`olleh\`

## Constraints
- The string will contain only lowercase English letters.
- Length: 1 ≤ n ≤ 1000`,
    difficulty: 'easy',
    language: 'java',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // Write your solution here
        
    }
}`,
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false },
      { input: 'world', expectedOutput: 'dlrow', isHidden: false },
      { input: 'a', expectedOutput: 'a', isHidden: true },
      { input: 'abcdef', expectedOutput: 'fedcba', isHidden: true },
    ],
    topic: 'strings',
  },
  {
    id: 'java-2',
    type: 'coding',
    title: 'FizzBuzz',
    description: `Write a Java program that reads an integer **n** from standard input and prints numbers from 1 to n. But for multiples of 3 print **"Fizz"**, for multiples of 5 print **"Buzz"**, and for multiples of both 3 and 5 print **"FizzBuzz"**.

Each output should be on a new line.

## Example
**Input:** \`5\`
**Output:**
\`\`\`
1
2
Fizz
4
Buzz
\`\`\``,
    difficulty: 'easy',
    language: 'java',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your solution here
        
    }
}`,
    testCases: [
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: false },
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: true },
      { input: '3', expectedOutput: '1\n2\nFizz', isHidden: true },
    ],
    topic: 'logic',
  },
  {
    id: 'java-3',
    type: 'coding',
    title: 'Find Duplicate Elements',
    description: `Write a Java program that reads a line of space-separated integers and prints the duplicate elements in the order they first appear as duplicates.

If there are no duplicates, print **"No duplicates"**.

## Example
**Input:** \`1 2 3 2 4 5 1\`
**Output:** \`2 1\`

**Input:** \`1 2 3\`
**Output:** \`No duplicates\`

## Constraints
- 1 ≤ n ≤ 100
- Elements are integers between -1000 and 1000`,
    difficulty: 'medium',
    language: 'java',
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(" ");
        // Write your solution here
        
    }
}`,
    testCases: [
      { input: '1 2 3 2 4 5 1', expectedOutput: '2 1', isHidden: false },
      { input: '1 2 3', expectedOutput: 'No duplicates', isHidden: false },
      { input: '5 5 5 5', expectedOutput: '5', isHidden: true },
      { input: '1 1 2 2 3 3', expectedOutput: '1 2 3', isHidden: true },
    ],
    topic: 'arrays',
  },
]

// ── Python Coding Questions ────────────────────────────────────────────────

export const PYTHON_QUESTIONS: CodingQuestion[] = [
  {
    id: 'python-1',
    type: 'coding',
    title: 'Palindrome Check',
    description: `Write a Python program that reads a string from standard input and prints **"True"** if it is a palindrome, **"False"** otherwise.

A palindrome reads the same forwards and backwards (case-insensitive, ignore spaces).

## Example
**Input:** \`racecar\`
**Output:** \`True\`

**Input:** \`hello\`
**Output:** \`False\`

**Input:** \`A man a plan a canal Panama\`
**Output:** \`True\``,
    difficulty: 'easy',
    language: 'python',
    starterCode: `s = input()
# Write your solution here
`,
    testCases: [
      { input: 'racecar', expectedOutput: 'True', isHidden: false },
      { input: 'hello', expectedOutput: 'False', isHidden: false },
      { input: 'A man a plan a canal Panama', expectedOutput: 'True', isHidden: true },
      { input: 'a', expectedOutput: 'True', isHidden: true },
    ],
    topic: 'strings',
  },
  {
    id: 'python-2',
    type: 'coding',
    title: 'Merge Sorted Lists',
    description: `Write a Python program that reads two lines of space-separated sorted integers and prints them merged into a single sorted list (space-separated).

## Example
**Input:**
\`\`\`
1 3 5 7
2 4 6 8
\`\`\`
**Output:** \`1 2 3 4 5 6 7 8\`

## Constraints
- Both lists are sorted in ascending order.
- Each list has at least 1 element and at most 50 elements.`,
    difficulty: 'medium',
    language: 'python',
    starterCode: `list1 = list(map(int, input().split()))
list2 = list(map(int, input().split()))
# Write your solution here
`,
    testCases: [
      { input: '1 3 5 7\n2 4 6 8', expectedOutput: '1 2 3 4 5 6 7 8', isHidden: false },
      { input: '1 2 3\n4 5 6', expectedOutput: '1 2 3 4 5 6', isHidden: false },
      { input: '1\n2', expectedOutput: '1 2', isHidden: true },
      { input: '1 1 1\n1 1 1', expectedOutput: '1 1 1 1 1 1', isHidden: true },
    ],
    topic: 'arrays',
  },
  {
    id: 'python-3',
    type: 'coding',
    title: 'Word Frequency Counter',
    description: `Write a Python program that reads a sentence from standard input and prints each unique word with its frequency, sorted by frequency (highest first). If two words have the same frequency, sort them alphabetically.

Words are case-insensitive. Print each word in lowercase.

## Example
**Input:** \`the cat sat on the mat the cat\`
**Output:**
\`\`\`
the 3
cat 2
mat 1
on 1
sat 1
\`\`\``,
    difficulty: 'medium',
    language: 'python',
    starterCode: `sentence = input()
# Write your solution here
`,
    testCases: [
      { input: 'the cat sat on the mat the cat', expectedOutput: 'the 3\ncat 2\nmat 1\non 1\nsat 1', isHidden: false },
      { input: 'hello hello world', expectedOutput: 'hello 2\nworld 1', isHidden: false },
      { input: 'a', expectedOutput: 'a 1', isHidden: true },
      { input: 'The the THE', expectedOutput: 'the 3', isHidden: true },
    ],
    topic: 'strings',
  },
]

// ── Database & Interview MCQs ──────────────────────────────────────────────

export const MCQ_QUESTIONS: McqQuestion[] = [
  {
    id: 'mcq-1',
    type: 'mcq',
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Logic',
      'Sequential Query Language',
    ],
    correctAnswer: 0,
    explanation: 'SQL stands for Structured Query Language, used to manage and manipulate relational databases.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-2',
    type: 'mcq',
    question: 'Which SQL JOIN returns all rows from both tables, matching where possible and filling NULLs where there is no match?',
    options: [
      'INNER JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'FULL OUTER JOIN',
    ],
    correctAnswer: 3,
    explanation: 'FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no matching row on the other side.',
    topic: 'database',
    difficulty: 'medium',
  },
  {
    id: 'mcq-3',
    type: 'mcq',
    question: 'What is database normalization primarily used for?',
    options: [
      'Improving query speed',
      'Reducing data redundancy and improving data integrity',
      'Adding more tables to the database',
      'Encrypting sensitive data',
    ],
    correctAnswer: 1,
    explanation: 'Normalization organizes data to reduce redundancy and improve data integrity by dividing a database into related tables.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-4',
    type: 'mcq',
    question: 'Which of the following is NOT a property of ACID transactions?',
    options: [
      'Atomicity',
      'Concurrency',
      'Isolation',
      'Durability',
    ],
    correctAnswer: 1,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Concurrency is not one of the ACID properties.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-5',
    type: 'mcq',
    question: 'What is the purpose of an INDEX in a database?',
    options: [
      'To enforce data constraints',
      'To speed up data retrieval queries',
      'To encrypt table columns',
      'To automatically backup data',
    ],
    correctAnswer: 1,
    explanation: 'An index is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-6',
    type: 'mcq',
    question: 'What is the time complexity of binary search?',
    options: [
      'O(n)',
      'O(n²)',
      'O(log n)',
      'O(n log n)',
    ],
    correctAnswer: 2,
    explanation: 'Binary search divides the search interval in half with each step, giving it O(log n) time complexity.',
    topic: 'algorithms',
    difficulty: 'easy',
  },
  {
    id: 'mcq-7',
    type: 'mcq',
    question: 'In a relational database, what is a PRIMARY KEY?',
    options: [
      'A key that can have duplicate values',
      'A unique identifier for each row in a table',
      'A key used to link two tables',
      'An encrypted column for security',
    ],
    correctAnswer: 1,
    explanation: 'A primary key uniquely identifies each record in a table. It must contain unique values and cannot contain NULL.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-8',
    type: 'mcq',
    question: 'What is a FOREIGN KEY used for?',
    options: [
      'To encrypt data in a column',
      'To create a link between two tables',
      'To speed up queries',
      'To generate unique IDs automatically',
    ],
    correctAnswer: 1,
    explanation: 'A foreign key is a field in one table that refers to the primary key of another table, creating a relationship between them.',
    topic: 'database',
    difficulty: 'easy',
  },
  {
    id: 'mcq-9',
    type: 'mcq',
    question: 'Which data structure uses FIFO (First In, First Out) ordering?',
    options: [
      'Stack',
      'Queue',
      'Binary Tree',
      'Hash Map',
    ],
    correctAnswer: 1,
    explanation: 'A Queue follows FIFO ordering — the first element added is the first one removed. A Stack follows LIFO (Last In, First Out).',
    topic: 'data-structures',
    difficulty: 'easy',
  },
  {
    id: 'mcq-10',
    type: 'mcq',
    question: 'Which SQL clause is used to filter groups of rows returned by GROUP BY?',
    options: [
      'WHERE',
      'HAVING',
      'FILTER',
      'GROUP FILTER',
    ],
    correctAnswer: 1,
    explanation: 'HAVING is used to filter groups after GROUP BY. WHERE filters individual rows before grouping.',
    topic: 'database',
    difficulty: 'medium',
  },
]

// ── Helper: Get questions for a language ────────────────────────────────────

export function getAssessmentQuestions(language: 'java' | 'python'): AssessmentQuestion[] {
  const codingQuestions = language === 'java' ? JAVA_QUESTIONS : PYTHON_QUESTIONS
  return [...codingQuestions, ...MCQ_QUESTIONS]
}

export function getCodingQuestions(language: 'java' | 'python'): CodingQuestion[] {
  return language === 'java' ? JAVA_QUESTIONS : PYTHON_QUESTIONS
}

export function getMcqQuestions(): McqQuestion[] {
  return MCQ_QUESTIONS
}
