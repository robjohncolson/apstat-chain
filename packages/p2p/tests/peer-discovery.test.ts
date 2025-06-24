import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { discoverPeers } from '../src/peer-discovery.js';

// Mock DNS-over-HTTPS server
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper function to mock all DNS providers
const mockAllProviders = (responses: Record<string, any>) => {
  const handlers = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query', 'https://dns.quad9.net/dns-query'].map(provider => 
    http.get(provider, ({ request }) => {
      const url = new URL(request.url);
      const name = url.searchParams.get('name');
      const type = url.searchParams.get('type');
      
      if (responses[name!] && type === '16') {
        return HttpResponse.json(responses[name!]);
      }
      
      return HttpResponse.json({ Status: 3 }); // NXDOMAIN
    })
  );
  
  server.use(...handlers);
};

describe('Peer Discovery', () => {
  describe('discoverPeers', () => {
    it('should discover peers from DNS TXT record', async () => {
      const seedDomain = 'peers.example.com';
      const mockPeerIds = ['peer1', 'peer2', 'peer3'];
      
      mockAllProviders({
        [seedDomain]: {
          Status: 0,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [
            {
              name: seedDomain,
              type: 16
            }
          ],
          Answer: [
            {
              name: seedDomain,
              type: 16,
              TTL: 300,
              data: `"${mockPeerIds.join(',')}"` // TXT record format with quotes
            }
          ]
        }
      });

      const result = await discoverPeers(seedDomain);
      
      expect(result).toEqual(mockPeerIds);
    });

    it('should handle multiple TXT records', async () => {
      const seedDomain = 'peers.example.com';
      const mockPeerIds1 = ['peer1', 'peer2'];
      const mockPeerIds2 = ['peer3', 'peer4'];
      
      mockAllProviders({
        [seedDomain]: {
          Status: 0,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [
            {
              name: seedDomain,
              type: 16
            }
          ],
          Answer: [
            {
              name: seedDomain,
              type: 16,
              TTL: 300,
              data: `"${mockPeerIds1.join(',')}"`
            },
            {
              name: seedDomain,
              type: 16,
              TTL: 300,
              data: `"${mockPeerIds2.join(',')}"`
            }
          ]
        }
      });

      const result = await discoverPeers(seedDomain);
      
      expect(result).toEqual([...mockPeerIds1, ...mockPeerIds2]);
    });

    it('should handle empty TXT record', async () => {
      const seedDomain = 'peers.example.com';
      
      mockAllProviders({
        [seedDomain]: {
          Status: 0,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [
            {
              name: seedDomain,
              type: 16
            }
          ],
          Answer: [
            {
              name: seedDomain,
              type: 16,
              TTL: 300,
              data: '""' // Empty TXT record
            }
          ]
        }
      });

      const result = await discoverPeers(seedDomain);
      
      expect(result).toEqual([]);
    });

    it('should handle no TXT records found', async () => {
      const seedDomain = 'nonexistent.example.com';
      
      mockAllProviders({
        [seedDomain]: {
          Status: 0,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [
            {
              name: seedDomain,
              type: 16
            }
          ],
          Answer: [] // No answers
        }
      });

      const result = await discoverPeers(seedDomain);
      
      expect(result).toEqual([]);
    });

    it('should handle DNS resolution errors', async () => {
      const seedDomain = 'error.example.com';
      
      mockAllProviders({
        [seedDomain]: {
          Status: 2 // SERVFAIL
        }
      });

      await expect(discoverPeers(seedDomain)).rejects.toThrow('DNS resolution failed: Server failure');
    });

    it('should handle network errors', async () => {
      const seedDomain = 'network-error.example.com';
      
      // Mock network error for all providers
      const handlers = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query', 'https://dns.quad9.net/dns-query'].map(provider => 
        http.get(provider, ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get('name');
          
          if (name === seedDomain) {
            return HttpResponse.error();
          }
          
          return HttpResponse.json({ Status: 3 });
        })
      );
      
      server.use(...handlers);

      await expect(discoverPeers(seedDomain)).rejects.toThrow();
    });

    it('should filter out empty peer IDs', async () => {
      const seedDomain = 'peers.example.com';
      const mockData = 'peer1,,peer2,   ,peer3,'; // Contains empty strings and whitespace
      
      mockAllProviders({
        [seedDomain]: {
          Status: 0,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [
            {
              name: seedDomain,
              type: 16
            }
          ],
          Answer: [
            {
              name: seedDomain,
              type: 16,
              TTL: 300,
              data: `"${mockData}"`
            }
          ]
        }
      });

      const result = await discoverPeers(seedDomain);
      
      expect(result).toEqual(['peer1', 'peer2', 'peer3']);
    });
  });
}); 