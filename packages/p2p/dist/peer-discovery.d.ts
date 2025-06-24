/**
 * Discover peers from a seed domain using DNS-over-HTTPS lookups.
 *
 * This function queries DNS TXT records for the specified seed domain
 * and parses comma-separated peer IDs from the record data.
 *
 * @param seedDomain - The domain to query for peer information
 * @param providerIndex - Internal parameter for provider fallback (default: 0)
 * @returns Promise<string[]> - Array of discovered peer IDs
 * @throws Error when DNS resolution fails or network errors occur
 */
export declare function discoverPeers(seedDomain: string, providerIndex?: number): Promise<string[]>;
/**
 * Discover peers with retry logic and exponential backoff.
 *
 * @param seedDomain - The domain to query for peer information
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000)
 * @returns Promise<string[]> - Array of discovered peer IDs
 */
export declare function discoverPeersWithRetry(seedDomain: string, maxRetries?: number, baseDelay?: number): Promise<string[]>;
//# sourceMappingURL=peer-discovery.d.ts.map