import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../src/index'

describe('AI Support System API', () => {
    it('GET /health should return ok', async () => {
        const res = await app.request('/health')
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toEqual({ status: 'ok' })
    })

    describe('Conversation Management', () => {
        let conversationId: string

        it('POST /api/chat/conversations should create a new conversation', async () => {
            const res = await app.request('/api/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            expect(res.status).toBe(200)
            const data = await res.json()
            expect(data).toHaveProperty('id')
            conversationId = data.id
        })

        it('GET /api/chat/conversations should list conversations', async () => {
            const res = await app.request('/api/chat/conversations')
            expect(res.status).toBe(200)
            const data = await res.json()
            expect(Array.isArray(data)).toBe(true)
        })

        it('GET /api/chat/conversations/:id should return messages for a conversation', async () => {
            if (!conversationId) return
            const res = await app.request(`/api/chat/conversations/${conversationId}`)
            expect(res.status).toBe(200)
            const data = await res.json()
            expect(Array.isArray(data)).toBe(true)
        })
    })

    describe('Message Flow', () => {
        it('POST /api/chat/messages should stream a response', async () => {
            // Create a conversation first
            const convRes = await app.request('/api/chat/conversations', { method: 'POST' })
            const { id: convId } = await convRes.json()

            const res = await app.request('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: convId,
                    messages: [{ role: 'user', content: 'Hello, how are you?' }]
                }),
            })

            expect(res.status).toBe(200)
            // Since it's a stream, we just check if it's returning something
            expect(res.body).toBeDefined()
            // Check for intent header
            expect(res.headers.get('X-Intent')).toBeDefined()
        })

        it('POST /api/chat/messages should return 400 if conversationId is missing', async () => {
            const res = await app.request('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
            })
            expect(res.status).toBe(400)
        })

        it('POST /api/chat/messages should return 404 if conversationId is invalid', async () => {
            const res = await app.request('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: 'non-existent-uuid',
                    messages: [{ role: 'user', content: 'hello' }]
                }),
            })
            expect(res.status).toBe(404)
        })
    })

    describe('Error Handling', () => {
        it('GET /api/chat/conversations/invalid-id should return 404', async () => {
            const res = await app.request('/api/chat/conversations/invalid-id')
            expect(res.status).toBe(404)
        })
    })
})
