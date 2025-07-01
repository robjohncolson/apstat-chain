# Phase 2 Blockchain Integration Example

This guide demonstrates how to integrate the CurriculumManager with BlockchainService to enable blockchain-powered activity tracking.

## Complete Integration Example

```typescript
// React component showing complete integration
import React, { useEffect, useState } from 'react';
import { 
  CurriculumManager, 
  type BlockchainIntegration,
  type ActivityCompletionTransaction 
} from '@apstat-chain/data';
import BlockchainService from '../services/BlockchainService';

export function StudentDashboard() {
  const [curriculumManager, setCurriculumManager] = useState<CurriculumManager | null>(null);
  const [blockchainConnected, setBlockchainConnected] = useState(false);

  useEffect(() => {
    // Initialize curriculum manager
    const manager = new CurriculumManager();
    
    // Connect to blockchain service
    const blockchainService = BlockchainService.getInstance();
    
    // Check if blockchain is initialized
    if (blockchainService.getState().isInitialized) {
      manager.setBlockchainService(blockchainService);
      setBlockchainConnected(true);
    }
    
    setCurriculumManager(manager);
  }, []);

  const handleVideoCompleted = async (unitId: string, topicId: string, videoIndex: number) => {
    if (!curriculumManager) return;
    
    try {
      const success = await curriculumManager.markVideoCompleted(unitId, topicId, videoIndex);
      
      if (success) {
        console.log('✅ Video marked as completed');
        if (blockchainConnected) {
          console.log('🔗 Blockchain transaction created');
        }
      }
    } catch (error) {
      console.error('Failed to mark video as completed:', error);
    }
  };

  const handleQuizCompleted = async (unitId: string, topicId: string, quizIndex: number) => {
    if (!curriculumManager) return;
    
    try {
      const success = await curriculumManager.markQuizCompleted(unitId, topicId, quizIndex);
      
      if (success) {
        console.log('✅ Quiz marked as completed');
        if (blockchainConnected) {
          console.log('🔗 Blockchain transaction created');
        }
      }
    } catch (error) {
      console.error('Failed to mark quiz as completed:', error);
    }
  };

  const handleBlooketCompleted = async (unitId: string, topicId: string) => {
    if (!curriculumManager) return;
    
    try {
      const success = await curriculumManager.markBlooketCompleted(unitId, topicId);
      
      if (success) {
        console.log('✅ Blooket marked as completed');
        if (blockchainConnected) {
          console.log('🔗 Blockchain transaction created');
        }
      }
    } catch (error) {
      console.error('Failed to mark blooket as completed:', error);
    }
  };

  // ... component rendering logic
}
```

## Blockchain Service Adapter

If you need to adapt a different blockchain service, implement the `BlockchainIntegration` interface:

```typescript
import type { BlockchainIntegration, ActivityCompletionTransaction } from '@apstat-chain/data';

class CustomBlockchainAdapter implements BlockchainIntegration {
  constructor(private customService: any) {}

  createTransaction(payload: ActivityCompletionTransaction) {
    // Adapt the payload format for your blockchain service
    return this.customService.submitTransaction({
      type: payload.type,
      data: payload.payload,
      // ... any custom fields your service needs
    });
  }

  getState() {
    const serviceState = this.customService.getStatus();
    return {
      isInitialized: serviceState.connected,
      currentKeyPair: serviceState.wallet ? {
        publicKey: serviceState.wallet.address
      } : null
    };
  }
}

// Usage
const customAdapter = new CustomBlockchainAdapter(myCustomBlockchainService);
curriculumManager.setBlockchainService(customAdapter);
```

## Transaction Payload Structure

Each activity completion generates a standardized transaction:

```typescript
{
  type: 'ACTIVITY_COMPLETE',
  payload: {
    unitId: 'unit1',           // Unit identifier
    topicId: '1-1',            // Topic identifier
    activityType: 'video',     // Activity type: 'video' | 'quiz' | 'blooket'
    activityId: string,        // Unique activity identifier:
                               //   - Video: video URL
                               //   - Quiz: quiz ID 
                               //   - Blooket: blooket URL
    timestamp: 1672531200000,  // Completion timestamp (milliseconds)
    studentId: 'pub_key...'    // Student's blockchain public key
  }
}
```

## Error Handling & Offline Mode

The integration gracefully handles various scenarios:

```typescript
// Scenario 1: Blockchain service not available
const manager = new CurriculumManager();
// No blockchain service set - works in offline mode
await manager.markVideoCompleted('unit1', '1-1', 0);
// ✅ Local completion succeeds, no blockchain transaction

// Scenario 2: Blockchain service not initialized
const uninitializedService = {
  createTransaction: () => { throw new Error('Not ready'); },
  getState: () => ({ isInitialized: false })
};
manager.setBlockchainService(uninitializedService);
await manager.markVideoCompleted('unit1', '1-1', 0);
// ✅ Local completion succeeds, blockchain skipped

// Scenario 3: Blockchain transaction fails
const errorService = {
  createTransaction: () => { throw new Error('Network error'); },
  getState: () => ({ isInitialized: true, currentKeyPair: { publicKey: 'key' } })
};
manager.setBlockchainService(errorService);
await manager.markVideoCompleted('unit1', '1-1', 0);
// ✅ Local completion succeeds, error logged
```

## Best Practices

1. **Initialize blockchain service early**: Set up the connection during app initialization
2. **Handle async operations**: All completion methods now return Promises
3. **Provide user feedback**: Show blockchain connection status to users
4. **Graceful degradation**: Ensure app works even without blockchain
5. **Error boundaries**: Wrap blockchain operations in try-catch blocks

## Migration from V1

If migrating from the legacy data access patterns:

```typescript
// V1 Pattern (deprecated)
import { ALL_UNITS_DATA } from '@apstat-chain/data';
const unit = ALL_UNITS_DATA.find(u => u.unitId === 'unit1');

// V2 Pattern (recommended)
import { CurriculumManager } from '@apstat-chain/data';
const manager = new CurriculumManager();
const unit = manager.getUnit('unit1');

// V2 with blockchain integration
manager.setBlockchainService(blockchainService);
await manager.markVideoCompleted('unit1', '1-1', 0);
```

This ensures your application is ready for blockchain-powered progress tracking while maintaining backward compatibility. 