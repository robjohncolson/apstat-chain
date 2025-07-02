import React, { useEffect, useState } from 'react';
import { gateway } from '@apstat-chain/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define types for our fetched data at the component level
type Completion = Awaited<ReturnType<typeof gateway.getCompletionTimestamps>>[0];
type User = Awaited<ReturnType<typeof gateway.getAllUsers>>[0];
type QuotaCount = Awaited<ReturnType<typeof gateway.getPeerQuotaCounts>>[0];
type PeerData = { username: string; count: number; isCurrentUser: boolean };

export const OverallProgressTab = () => {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [peerData, setPeerData] = useState<PeerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [completionsData, usersData, quotasData, currentUserId] = await Promise.all([
          gateway.getCompletionTimestamps(),
          gateway.getAllUsers(),
          gateway.getPeerQuotaCounts(),
          gateway.getCurrentUserId(),
        ]);

        setCompletions(completionsData);

        // Process peer data
        const quotaMap = new Map(quotasData.map((q: QuotaCount) => [q.user_id, q.quota_count]));
        const processedPeerData = usersData
          .map((user: User) => ({
            username: user.username,
            count: quotaMap.get(user.id) || 0,
            isCurrentUser: user.id === currentUserId,
          }))
          .sort((a: PeerData, b: PeerData) => b.count - a.count); // Sort by count descending
        
        setPeerData(processedPeerData);

      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading overall progress...</p>;
  }

  // Simple dot plot visualization logic
  const totalCompletions = completions.length;
  const videoCompletions = completions.filter(c => c.item_type === 'video').length;
  const quizCompletions = completions.filter(c => c.item_type === 'quiz').length;
  const videoProgress = totalCompletions > 0 ? (videoCompletions / totalCompletions) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-slate-600">Total Completions: {totalCompletions}</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span>Videos</span>
                <span>{videoCompletions}</span>
              </div>
              <Progress value={videoProgress} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span>Quizzes</span>
                <span>{quizCompletions}</span>
              </div>
               <Progress value={100 - videoProgress} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peer Quota Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Quotas Met</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peerData.map((peer, index) => (
                <TableRow key={peer.username} className={peer.isCurrentUser ? 'bg-blue-50' : ''}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{peer.username}</TableCell>
                  <TableCell className="text-right">{peer.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}; 