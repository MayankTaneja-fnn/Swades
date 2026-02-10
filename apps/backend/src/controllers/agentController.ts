import { Context } from 'hono';
import { getAgentCapabilities } from '../config/agentCapabilities.js';

export const listAgentsController = async (c: Context) => {
    const capabilities = getAgentCapabilities();
    return c.json(capabilities);
};

export const getAgentCapabilitiesController = async (c: Context) => {
    const type = c.req.param('type');
    console.log(`[DEBUG] Requested agent type: ${type}`);
    const capability = getAgentCapabilities(type);
    console.log(`[DEBUG] Found capability:`, capability);

    if (!capability) {
        return c.json({ error: 'Agent not found' }, 404);
    }

    return c.json(capability);
};
