import type { Transaction } from '@apstat-chain/core';

interface LeaderboardEntry {
  publicKey: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  transactions: Transaction[];
}

export function Leaderboard({ transactions }: LeaderboardProps) {

  // Helper function to truncate long strings
  const truncate = (str: string, length: number = 20) => {
    return str.length > length ? `${str.slice(0, length)}...` : str;
  };

  // Process transactions to create leaderboard data
  const createLeaderboard = (): LeaderboardEntry[] => {
    // Group transactions by author public key
    const userTransactions = new Map<string, Set<string>>();

    // Filter for LESSON_COMPLETE transactions and group by author
    transactions
      .filter(transaction => transaction.payload?.type === 'LESSON_COMPLETE')
      .forEach(transaction => {
        const authorKey = transaction.authorPublicKey.hex;
        const lessonId = transaction.payload.lessonId;

        if (!userTransactions.has(authorKey)) {
          userTransactions.set(authorKey, new Set());
        }
        
        // Add unique lesson IDs only
        if (lessonId) {
          userTransactions.get(authorKey)!.add(lessonId);
        }
      });

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = Array.from(userTransactions.entries())
      .map(([publicKey, uniqueLessons]) => ({
        publicKey,
        score: uniqueLessons.size,
        rank: 0, // Will be set after sorting
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  };

  const leaderboardData = createLeaderboard();

  return (
    <div className="bg-orange-50 dark:bg-orange-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-4">
        Leaderboard ({leaderboardData.length} users)
      </h2>
      
      {leaderboardData.length === 0 ? (
        <div className="text-orange-700 dark:text-orange-300 text-sm text-center py-4">
          No lesson completions yet. Complete some lessons to see the leaderboard!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orange-200 dark:border-orange-700">
                <th className="text-left py-2 px-3 font-medium text-orange-700 dark:text-orange-300">
                  Rank
                </th>
                <th className="text-left py-2 px-3 font-medium text-orange-700 dark:text-orange-300">
                  Public Key
                </th>
                <th className="text-left py-2 px-3 font-medium text-orange-700 dark:text-orange-300">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr 
                  key={entry.publicKey} 
                  className={`border-b border-orange-100 dark:border-orange-800 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-orange-25 dark:bg-orange-950'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400' :
                      entry.rank === 3 ? 'bg-orange-600' :
                      'bg-orange-500'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    <span title={entry.publicKey}>
                      {truncate(entry.publicKey, 32)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200">
                      {entry.score} lesson{entry.score !== 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 