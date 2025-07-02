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