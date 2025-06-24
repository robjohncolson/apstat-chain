/**
 * DNS-over-HTTPS response structure for TXT records
 */
interface DnsResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{
    name: string;
    type: number;
  }>;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

/**
 * DNS-over-HTTPS provider configuration
 */
const DOH_PROVIDERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/dns-query',
  'https://dns.quad9.net/dns-query'
];

/**
 * DNS record types
 */
const DNS_RECORD_TYPES = {
  TXT: 16
} as const;

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
export async function discoverPeers(seedDomain: string, providerIndex: number = 0): Promise<string[]> {
  if (providerIndex >= DOH_PROVIDERS.length) {
    throw new Error('All DNS-over-HTTPS providers failed');
  }

  const provider = DOH_PROVIDERS[providerIndex];
  const url = new URL(provider);
  
  // Set DNS-over-HTTPS query parameters
  url.searchParams.set('name', seedDomain);
  url.searchParams.set('type', DNS_RECORD_TYPES.TXT.toString());
  url.searchParams.set('do', 'false'); // No DNSSEC validation required
  url.searchParams.set('cd', 'false'); // No checking disabled

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json',
        'Content-Type': 'application/dns-json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const dnsResponse: DnsResponse = await response.json();

    // Check DNS response status
    if (dnsResponse.Status !== 0) {
      if (dnsResponse.Status === 2) {
        throw new Error('DNS resolution failed: Server failure');
      } else if (dnsResponse.Status === 3) {
        // NXDOMAIN - domain doesn't exist, return empty array
        return [];
      } else {
        throw new Error(`DNS resolution failed with status: ${dnsResponse.Status}`);
      }
    }

    // Parse TXT records and extract peer IDs
    const peerIds: string[] = [];
    
    if (dnsResponse.Answer) {
      for (const record of dnsResponse.Answer) {
        if (record.type === DNS_RECORD_TYPES.TXT) {
          // Parse TXT record data - remove surrounding quotes if present
          let txtData = record.data;
          if (txtData.startsWith('"') && txtData.endsWith('"')) {
            txtData = txtData.slice(1, -1);
          }
          
          // Split by comma and filter out empty strings
          const peers = txtData
            .split(',')
            .map(peer => peer.trim())
            .filter(peer => peer.length > 0);
          
          peerIds.push(...peers);
        }
      }
    }

    return peerIds;

  } catch (error) {
    // Try next provider if available
    if (providerIndex < DOH_PROVIDERS.length - 1) {
      console.warn(`DNS provider ${provider} failed, trying next provider:`, error);
      return discoverPeers(seedDomain, providerIndex + 1);
    }
    
    // If this is the last provider or a DNS resolution error, rethrow
    throw error;
  }
}

/**
 * Discover peers with retry logic and exponential backoff.
 * 
 * @param seedDomain - The domain to query for peer information
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000)
 * @returns Promise<string[]> - Array of discovered peer IDs
 */
export async function discoverPeersWithRetry(
  seedDomain: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<string[]> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await discoverPeers(seedDomain);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Peer discovery attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
} 