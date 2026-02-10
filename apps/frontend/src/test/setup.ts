import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock @ai-sdk/react globally
vi.mock('@ai-sdk/react', () => ({
    useChat: vi.fn(() => ({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        setMessages: vi.fn(),
    })),
}))

// Mock fetch globally
const fetchMock = vi.fn((url: any, options: any) => {
    const urlString = url.toString();

    // Default response structure
    const createResponse = (data: any) => Promise.resolve({
        ok: true,
        status: 200,
        json: async () => data,
    });

    // Handle conversations list (GET)
    if (urlString.includes('/api/chat/conversations') && (!options || options.method === 'GET')) {
        return createResponse([]);
    }

    // Handle create conversation (POST)
    if (urlString.includes('/api/chat/conversations') && options?.method === 'POST') {
        return createResponse({ id: 'mock-conv-id', userId: 'mock-user' });
    }

    // Handle specific conversation (GET)
    if (urlString.match(/\/api\/chat\/conversations\/[-\w]+$/)) {
        return createResponse([]);
    }

    // Default fallback
    return createResponse({});
});

vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})
