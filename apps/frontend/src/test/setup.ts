import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'


Element.prototype.scrollIntoView = vi.fn()


vi.mock('@ai-sdk/react', () => ({
    useChat: vi.fn(() => ({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        setMessages: vi.fn(),
    })),
}))


const fetchMock = vi.fn((url: any, options: any) => {
    const urlString = url.toString();


    const createResponse = (data: any) => Promise.resolve({
        ok: true,
        status: 200,
        json: async () => data,
    });


    if (urlString.includes('/api/chat/conversations') && (!options || options.method === 'GET')) {
        return createResponse([]);
    }


    if (urlString.includes('/api/chat/conversations') && options?.method === 'POST') {
        return createResponse({ id: 'mock-conv-id', userId: 'mock-user' });
    }


    if (urlString.match(/\/api\/chat\/conversations\/[-\w]+$/)) {
        return createResponse([]);
    }


    return createResponse({});
});

vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})
