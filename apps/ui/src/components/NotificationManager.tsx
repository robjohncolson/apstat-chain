import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useBlockchain } from '../providers/BlockchainProvider';
// import type { NotificationEvent } from '../services/BlockchainService'; // Unused import

export function NotificationManager() {
  const { state } = useBlockchain();
  const processedEventIds = useRef(new Set<string>());

  useEffect(() => {
    // Only process events that haven't been processed before
    if (state.lastEvent && !processedEventIds.current.has(state.lastEvent.id)) {
      const event = state.lastEvent;
      processedEventIds.current.add(event.id);
      
      switch (event.type) {
        case 'CANDIDATE_BLOCK_RECEIVED':
          toast.info('🧩 New Block Ready for Attestation!', {
            description: `A new candidate block is ready for your input on puzzle ${event.data.puzzleId}. Your knowledge is needed!`,
            duration: 6000,
          });
          break;
          
        case 'TRANSACTION_MINED':
          const { transactionCount, transactions } = event.data;
          const activityTypes = transactions.map((tx: any) => tx.type).join(', ');
          toast.success('⛏️ Your Contributions Were Mined!', {
            description: `${transactionCount} of your transactions were successfully added to the blockchain. Types: ${activityTypes}`,
            duration: 8000,
          });
          break;
          
        case 'ELIGIBLE_TO_MINE':
          const { mempoolSize, contributionTotal } = event.data;
          toast.success('💎 You Can Now Mine a Block!', {
            description: `The network has ${mempoolSize} pending transactions (${contributionTotal} contribution points). Your knowledge qualifies you to mine!`,
            duration: 10000,
            action: {
              label: 'Start Mining',
              onClick: () => {
                // Scroll to mining section or trigger mining view
                const miningSection = document.querySelector('[data-mining-section]');
                if (miningSection) {
                  miningSection.scrollIntoView({ behavior: 'smooth' });
                }
              },
            },
          });
          break;
          
        case 'PEER_CONNECTED':
          toast.success('🌐 New Peer Connected!', {
            description: `Connected to peer ${event.data.peerId.slice(0, 8)}... The network grows stronger!`,
            duration: 4000,
          });
          break;
          
        default:
          console.warn('Unknown event type:', event.type);
      }
    }
  }, [state.lastEvent]);

  // This component doesn't render anything visible
  return null;
} 