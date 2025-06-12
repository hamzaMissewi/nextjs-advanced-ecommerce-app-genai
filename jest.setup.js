"use client"

import "@testing-library/jest-dom"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ""
  },
}))

// Mock Elasticsearch client
jest.mock("@elastic/elasticsearch", () => ({
  Client: jest.fn().mockImplementation(() => ({
    search: jest.fn(),
    index: jest.fn(),
    indices: {
      exists: jest.fn(),
      create: jest.fn(),
    },
  })),
}))

// Mock Neo4j driver
jest.mock("neo4j-driver", () => ({
  driver: jest.fn().mockImplementation(() => ({
    session: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
      close: jest.fn(),
    })),
    close: jest.fn(),
  })),
  auth: {
    basic: jest.fn(),
  },
}))
