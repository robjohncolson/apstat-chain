import { ALL_UNITS_DATA, CurriculumUnit } from '@apstat-chain/data';

/**
 * Fetches the entire curriculum structure.
 * In the future, this could be fetched from a decentralized source.
 * For now, it returns the hardcoded data instantly.
 */
export const getCurriculumData = async (): Promise<CurriculumUnit[]> => {
  console.log('GATEWAY: getCurriculumData() called');
  // We wrap it in a Promise to simulate a real network request.
  return Promise.resolve(ALL_UNITS_DATA);
};

/**
 * Simulates saving a completion record.
 * The UI will call this, and we'll just log it for now.
 * @param {string} unitId - e.g., 'unit1'
 * @param {string} activityId - e.g., '1-2_q1'
 * @param {'video' | 'quiz'} activityType
 */
export const saveCompletion = async (unitId: string, activityId: string, activityType: string) => {
  console.log(`GATEWAY: Simulating saveCompletion for ${activityType} ${activityId} in ${unitId}`);
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('GATEWAY: Save successful (mocked).');
  return Promise.resolve({ success: true, timestamp: new Date().toISOString() });
};

interface MockCompletion {
  completed_at: string;
  item_type: 'video' | 'quiz';
}

interface MockUser {
  id: number;
  username: string;
}

interface MockQuotaCount {
  user_id: number;
  quota_count: number;
}

// Simulates fetching all completion timestamps for the current user
export const getCompletionTimestamps = async (): Promise<MockCompletion[]> => {
  console.log('GATEWAY: getCompletionTimestamps() called');
  // Return a realistic-looking mock dataset
  return Promise.resolve([
    { completed_at: new Date(Date.now() - 4 * 86400000).toISOString(), item_type: 'video' },
    { completed_at: new Date(Date.now() - 4 * 86400000).toISOString(), item_type: 'quiz' },
    { completed_at: new Date(Date.now() - 3 * 86400000).toISOString(), item_type: 'video' },
    { completed_at: new Date(Date.now() - 1 * 86400000).toISOString(), item_type: 'quiz' },
    { completed_at: new Date(Date.now() - 1 * 86400000).toISOString(), item_type: 'quiz' },
    { completed_at: new Date().toISOString(), item_type: 'video' },
  ]);
};

// Simulates fetching all users
export const getAllUsers = async (): Promise<MockUser[]> => {
  console.log('GATEWAY: getAllUsers() called');
  return Promise.resolve([
    { id: 1, username: 'Alice' },
    { id: 2, username: 'Bob (You)' },
    { id: 3, username: 'Charlie' },
    { id: 4, username: 'Diana' },
  ]);
};

// Simulates fetching the total number of quotas met per user
export const getPeerQuotaCounts = async (): Promise<MockQuotaCount[]> => {
  console.log('GATEWAY: getPeerQuotaCounts() called');
  return Promise.resolve([
    { user_id: 1, quota_count: 12 },
    { user_id: 2, quota_count: 8 },
    { user_id: 3, quota_count: 15 },
    { user_id: 4, quota_count: 5 },
  ]);
};

// Simulates getting the current user's ID
export const getCurrentUserId = async (): Promise<number> => {
  return Promise.resolve(2); // Mocking that "Bob" is the current user
};

/**
 * Returns the Grok AI tutor prompt for guided learning sessions.
 * This static content provides comprehensive instructions for AI-assisted study.
 */
export const getGrokPrompt = () => {
  return `You are an expert AP Statistics tutor. I will provide you with AP Statistics questions, which could be either multiple choice (MCQ) or free response (FRQ). For each question, I will indicate the type (MCQ or FRQ). Your task is to guide me through the questions as follows:

For MCQs:
- Present the Question: Display the multiple choice question with all answer options (A, B, C, D, E).
- Analyze My Answer: After I submit my answer:
  - If Correct: Confirm that my answer is correct and proceed to the next question.
  - If Incorrect: Identify my misconception and provide scaffolded guidance without revealing the answer.
- Provide Context (If Needed): For incorrect answers, once I arrive at the correct answer, provide relevant context.
- Summarize the Concept: Summarize the key concept being tested (only if I answered incorrectly).
- Check for Questions: Ask if I have additional questions before moving on (only if I needed guidance).

For FRQs:
- Present the Question: Display the free response question.
- Break It Down: Break down the question into smaller, scaffolded steps.
- Request Responses: For each scaffolded question, ask me to provide a response.
- Grade My Response: Evaluate my response based on the AP grading rubric.
- Guide Me: If my response is lacking, offer hints to help me improve.
- Ensure Perfection: Continue until I can provide a response that meets the rubric's requirements.
- Summarize the Concepts: Once completed correctly, summarize the key concepts.
- Check for Questions: Ask if I have additional questions before moving on.

Throughout the Session:
- Track Performance: Monitor my performance to provide personalized guidance.
- Session Summary: At the end, summarize key concepts and suggest areas for additional practice.

Thank you for helping me prepare for my AP Statistics exam!`;
}; 