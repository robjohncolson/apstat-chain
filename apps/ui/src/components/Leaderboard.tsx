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
        const authorKey = transaction.publicKey;
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

  // Helper function to get rank styling
  const getRankStyling = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          text: 'text-white',
          icon: '🥇',
          glow: 'shadow-yellow-200 dark:shadow-yellow-900'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
          text: 'text-white',
          icon: '🥈',
          glow: 'shadow-gray-200 dark:shadow-gray-800'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
          text: 'text-white',
          icon: '🥉',
          glow: 'shadow-orange-200 dark:shadow-orange-900'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          text: 'text-white',
          icon: '🎓',
          glow: 'shadow-blue-200 dark:shadow-blue-900'
        };
    }
  };

  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-3xl">🏆</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Rankings Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete some lessons to see the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          <span className="mr-3 text-4xl">🏆</span>
          Leaderboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Top learners in the APStat Chain network
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="mb-8">
          <div className="flex items-end justify-center space-x-4 mb-6">
            {/* Second Place */}
            {leaderboardData[1] && (
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-2 min-w-[120px]">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      2
                    </div>
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {truncate(leaderboardData[1].publicKey, 12)}
                    </p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {leaderboardData[1].score}
                    </p>
                  </div>
                </div>
                <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center text-white font-bold">
                  🥈
                </div>
              </div>
            )}

            {/* First Place */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl mb-2 min-w-[120px] relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">👑</span>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-yellow-200 dark:shadow-yellow-900">
                    1
                  </div>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {truncate(leaderboardData[0].publicKey, 12)}
                  </p>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                    {leaderboardData[0].score}
                  </p>
                </div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center text-white font-bold text-lg">
                🥇
              </div>
            </div>

            {/* Third Place */}
            {leaderboardData[2] && (
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-2 min-w-[120px]">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      3
                    </div>
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {truncate(leaderboardData[2].publicKey, 12)}
                    </p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {leaderboardData[2].score}
                    </p>
                  </div>
                </div>
                <div className="w-20 h-12 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg flex items-center justify-center text-white font-bold">
                  🥉
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
            All Rankings ({leaderboardData.length} learners)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 dark:text-gray-300">
                  Learner
                </th>
                <th className="text-center py-3 px-6 font-semibold text-gray-700 dark:text-gray-300">
                  Lessons Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboardData.map((entry) => {
                const styling = getRankStyling(entry.rank);
                
                return (
                  <tr 
                    key={entry.publicKey} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${styling.bg} ${styling.text} shadow-lg ${styling.glow} mr-3`}>
                          {entry.rank <= 3 ? styling.icon : entry.rank}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          #{entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mr-3">
                          <span className="text-lg">🎓</span>
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-600 dark:text-gray-400" title={entry.publicKey}>
                            {truncate(entry.publicKey, 32)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Public Key
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center">
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${
                          entry.rank <= 3 
                            ? `${styling.bg} ${styling.text} shadow-lg`
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {entry.score} lesson{entry.score !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 