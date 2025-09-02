import { describe, it, expect, vi } from 'vitest'
import { extractClientIp, extractDomain, extractRequestMetadata } from '../request-metadata'
import type { headers } from 'next/headers'

// Type for mocked headers
type MockHeaders = Awaited<ReturnType<typeof headers>>

describe('request-metadata utils', () => {
  describe('extractClientIp', () => {
    it('should prioritize cf-connecting-ip header', () => {
      const mockHeaders = {
        get: vi.fn((header: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '192.168.1.1',
            'x-forwarded-for': '10.0.0.1, 10.0.0.2',
            'x-real-ip': '172.16.0.1',
          }
          return headers[header.toLowerCase()]
        }),
      } as unknown as MockHeaders

      const ip = extractClientIp(mockHeaders)
      expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to x-forwarded-for when cf-connecting-ip not present', () => {
      const mockHeaders = {
        get: vi.fn((header: string) => {
          const headers: Record<string, string> = {
            'x-forwarded-for': '10.0.0.1, 10.0.0.2',
            'x-real-ip': '172.16.0.1',
          }
          return headers[header.toLowerCase()]
        }),
      } as unknown as MockHeaders

      const ip = extractClientIp(mockHeaders)
      expect(ip).toBe('10.0.0.1') // Should take first IP
    })

    it('should fallback to x-real-ip when others not present', () => {
      const mockHeaders = {
        get: vi.fn((header: string) => {
          const headers: Record<string, string> = {
            'x-real-ip': '172.16.0.1',
          }
          return headers[header.toLowerCase()]
        }),
      } as unknown as MockHeaders

      const ip = extractClientIp(mockHeaders)
      expect(ip).toBe('172.16.0.1')
    })

    it('should return unknown when no IP headers present', () => {
      const mockHeaders = {
        get: vi.fn(() => null),
      } as unknown as MockHeaders

      const ip = extractClientIp(mockHeaders)
      expect(ip).toBe('unknown')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from valid URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('example.com')
      expect(extractDomain('http://example.com/path')).toBe('example.com')
      expect(extractDomain('https://subdomain.example.com')).toBe('subdomain.example.com')
    })

    it('should remove www prefix', () => {
      expect(extractDomain('https://www.example.com')).toBe('example.com')
      expect(extractDomain('http://www.test.com')).toBe('test.com')
    })

    it('should return empty string for invalid URLs', () => {
      expect(extractDomain('not-a-url')).toBe('')
      expect(extractDomain('file:///path/to/file')).toBe('')
    })

    it('should return empty string for null/undefined', () => {
      expect(extractDomain(null)).toBe('')
      expect(extractDomain(undefined)).toBe('')
      expect(extractDomain('')).toBe('')
    })
  })

  describe('extractRequestMetadata', () => {
    it('should extract all metadata correctly', () => {
      const mockHeaders = {
        get: vi.fn((header: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '192.168.1.1',
            'user-agent': 'Mozilla/5.0',
          }
          return headers[header.toLowerCase()]
        }),
      } as unknown as MockHeaders

      const url = 'https://www.example.com/article/test'
      const metadata = extractRequestMetadata(mockHeaders, url)

      expect(metadata).toEqual({
        ip: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        domain: 'example.com',
        url: 'https://www.example.com/article/test',
      })
    })

    it('should handle missing headers gracefully', () => {
      const mockHeaders = {
        get: vi.fn(() => null),
      } as unknown as MockHeaders

      const url = 'https://example.com'
      const metadata = extractRequestMetadata(mockHeaders, url)

      expect(metadata).toEqual({
        ip: 'unknown',
        user_agent: '',
        domain: 'example.com',
        url: 'https://example.com',
      })
    })
  })
})
