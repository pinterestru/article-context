import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock server-only module for tests
vi.mock('server-only', () => ({
  default: {},
}))

// Mock React cache for tests
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  }
})
