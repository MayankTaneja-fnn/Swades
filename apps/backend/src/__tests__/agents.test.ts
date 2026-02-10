import { describe, it, expect, vi } from 'vitest';

// Mock serve to prevent server startup during tests
vi.mock('@hono/node-server', () => ({
    serve: vi.fn(),
}));

import { app } from '../index.js';

describe('Agent Routes', () => {
    it('GET /api/agents should return a list of agents', async () => {
        const res = await app.request('/api/agents');
        expect(res.status).toBe(200);
        const data = await res.json() as any[];
        expect(Array.isArray(data)).toBe(true);
        // Expect at least the default system agent or mock agents
        expect(data.length).toBeGreaterThan(0);
    });

    it('GET /api/agents/ORDER/capabilities should return capabilities for ORDER agent', async () => {
        const res = await app.request('/api/agents/ORDER/capabilities');
        expect(res.status).toBe(200);
        const data = await res.json() as { tools: string[], type: string };
        expect(data).toHaveProperty('type', 'ORDER');
        expect(data).toHaveProperty('tools');
        expect(Array.isArray(data.tools)).toBe(true);
    });
});
