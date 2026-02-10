import { describe, it, expect, vi } from 'vitest';

// Mock serve to prevent server startup during tests
vi.mock('@hono/node-server', () => ({
    serve: vi.fn(),
}));

import { app } from '../index.js';

describe('Chat Routes', () => {
    // Strategy: Use app.request for Hono-native testing

    it('GET /api/chat/conversations should return a list of conversations', async () => {
        const res = await app.request('/api/chat/conversations');
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
    });

    it('POST /api/chat/conversations should create a new conversation', async () => {
        const res = await app.request('/api/chat/conversations', {
            method: 'POST',
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('userId');
    });

    it('GET /api/chat/conversations/:id should return a specific conversation', async () => {
        // First create a conversation
        const createRes = await app.request('/api/chat/conversations', {
            method: 'POST',
        });
        const conversation = await createRes.json() as { id: string };

        // Then fetch it by ID
        const res = await app.request(`/api/chat/conversations/${conversation.id}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true); // Returns messages array
    });

    it('DELETE /api/chat/conversations/:id should delete a conversation', async () => {
        // First create a conversation
        const createRes = await app.request('/api/chat/conversations', {
            method: 'POST',
        });
        const conversation = await createRes.json() as { id: string };

        // Then delete it
        const res = await app.request(`/api/chat/conversations/${conversation.id}`, {
            method: 'DELETE',
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('success', true);
    });

    it('POST /api/chat/messages should handle message sending', async () => {
        // First create a conversation
        const createRes = await app.request('/api/chat/conversations', {
            method: 'POST',
        });
        const conversation = await createRes.json() as { id: string };

        const res = await app.request('/api/chat/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: conversation.id,
                messages: [{ role: 'user', content: 'Hello' }],
            }),
        });
        // Streaming endpoint returns 200 and starts streaming
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/event-stream');
    });

    it('POST /api/chat/ should handle default SDK behavior', async () => {
        // First create a conversation
        const createRes = await app.request('/api/chat/conversations', {
            method: 'POST',
        });
        const conversation = await createRes.json() as { id: string };

        const res = await app.request('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: conversation.id,
                messages: [{ role: 'user', content: 'Test message' }],
            }),
        });
        // Should also handle streaming
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/event-stream');
    });
});

