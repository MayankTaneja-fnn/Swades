import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Chat from '../components/Chat'
import { useChat } from '@ai-sdk/react'


vi.mock('@ai-sdk/react', () => ({
    useChat: vi.fn(),
}))

describe('Chat Component', () => {
    const mockSendMessage = vi.fn()
    const mockSetMessages = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        (useChat as any).mockReturnValue({
            messages: [],
            sendMessage: mockSendMessage,
            status: 'ready',
            setMessages: mockSetMessages,
        });
    })

    it('renders without crashing', () => {
        const { container } = render(<Chat />)
        expect(container).toBeTruthy()
    })
})
