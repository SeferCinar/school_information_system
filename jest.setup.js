// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock environment variables for testing
process.env.MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/test_db'
process.env.NODE_ENV = 'test'

// Mock mongoose to avoid actual database connections in tests
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose')
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(actualMongoose),
    disconnect: jest.fn().mockResolvedValue(undefined),
    connection: {
      readyState: 0,
      db: null,
    },
  }
})

// Suppress console errors in tests (optional - remove if you want to see all console output)
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // error: jest.fn(),
  // warn: jest.fn(),
}
