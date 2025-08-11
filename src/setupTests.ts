// Jest-DOM matchers for Testing Library
import '@testing-library/jest-dom'

// Start MSW for tests that may rely on network calls
import { server } from './mocks/server'

// Establish API mocking before all tests.
/* global beforeAll, afterEach, afterAll */
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios).
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

