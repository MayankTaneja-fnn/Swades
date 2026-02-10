import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Chat from './Chat'
import * as aiSdk from '@ai-sdk/react'

// Mock useChat hook
vi.mock('@ai-sdk/react', () => ({
    useChat: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Chat Component', () => {
    const mockMessages = [
        { id: '1', role: 'user', content: 'Hello', parts: [{ type: 'text', text: 'Hello' }], annotations: [] },
        { id: '2', role: 'assistant', content: 'Hi there!', parts: [{ type: 'text', text: 'Hi there!' }], annotations: [] },
    ]

    const mockSendMessage = vi.fn()
    const mockSetMessages = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

            // Default useChat mock implementation
            ; (aiSdk.useChat as any).mockReturnValue({
                messages: [],
                sendMessage: mockSendMessage,
                status: 'idle',
                setMessages: mockSetMessages,
            })

            // Default fetch mocks
            ; (global.fetch as any).mockImplementation((url: string) => {
                if (url === '/api/chat/conversations') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([{ id: 'conv-1', userId: 'user-123', messages: [{ content: 'Hello' }] }]),
                    })
                }
                if (url === '/api/chat/conversations/conv-1') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve([{ id: 'msg-1', role: 'user', content: 'Hello' }]),
                    })
                }
                if (url === '/api/chat/conversations' && (global.fetch as any).mock.calls.some((call: any) => call[1]?.method === 'POST')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ id: 'new-conv-id' }),
                    })
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
            })

        // Mock localStorage
        const localStorageMock = (function () {
            let store: { [key: string]: string } = {}
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => { store[key] = value },
                removeItem: (key: string) => { delete store[key] },
                clear: () => { store = {} }
            }
        })()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    })

    it('renders the chat hub title', async () => {
        render(<Chat />)
        expect(screen.getByText('AI Support Hub')).toBeInTheDocument()
    })

    it('loads conversations on mount', async () => {
        render(<Chat />)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/chat/conversations')
        })
    })

    it('shows loading state initially', () => {
        render(<Chat />)
        expect(screen.getByText('Loading conversation...')).toBeInTheDocument()
    })

    it('updates input field when typing', async () => {
        render(<Chat />)
        // Wait for initialization
        await waitFor(() => expect(screen.queryByText('Loading conversation...')).not.toBeInTheDocument())

        const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement
        fireEvent.change(input, { target: { value: 'Test message' } })
        expect(input.value).toBe('Test message')
    })

    it('calls sendMessage when form is submitted', async () => {
        render(<Chat />)
        await waitFor(() => expect(screen.queryByText('Loading conversation...')).not.toBeInTheDocument())

        const input = screen.getByPlaceholderText(/Type your message/i)
        fireEvent.change(input, { target: { value: 'Hello AI' } })

        const sendButton = screen.getByRole('button', { name: /send/i })
        fireEvent.click(sendButton)

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalled()
        })
    })
})
