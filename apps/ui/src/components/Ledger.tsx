import type { Transaction } from '@apstat-chain/core';

interface LedgerProps {
  transactions: Transaction[];
}

export function Ledger({ transactions }: LedgerProps) {

  // Helper function to truncate long strings
  const truncate = (str: string, length: number = 12) => {
    return str.length > length ? `${str.slice(0, length)}...` : str;
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
        Global Ledger ({transactions.length} transactions)
      </h2>
      
      {transactions.length === 0 ? (
        <div className="text-indigo-700 dark:text-indigo-300 text-sm text-center py-4">
          No transactions yet. Complete a lesson to see your first transaction!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-200 dark:border-indigo-700">
                <th className="text-left py-2 px-3 font-medium text-indigo-700 dark:text-indigo-300">
                  Transaction ID
                </th>
                <th className="text-left py-2 px-3 font-medium text-indigo-700 dark:text-indigo-300">
                  Author Public Key
                </th>
                <th className="text-left py-2 px-3 font-medium text-indigo-700 dark:text-indigo-300">
                  Timestamp
                </th>
                <th className="text-left py-2 px-3 font-medium text-indigo-700 dark:text-indigo-300">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr 
                  key={transaction.id} 
                  className={`border-b border-indigo-100 dark:border-indigo-800 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-indigo-25 dark:bg-indigo-950'
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-xs">
                    <span title={transaction.id}>
                      {truncate(transaction.id, 16)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    <span title={transaction.authorPublicKey.hex}>
                      {truncate(transaction.authorPublicKey.hex, 16)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    {formatTimestamp(transaction.timestamp)}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <div className="max-w-xs overflow-hidden">
                      <pre className="whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                        {JSON.stringify(transaction.payload, null, 2)}
                      </pre>
                    </div>
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