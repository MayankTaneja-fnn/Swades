import { Hono } from 'hono';
import { listAgentsController, getAgentCapabilitiesController } from '../controllers/agentController';

const agentsRouter = new Hono();

// GET /api/agents - List available agents
agentsRouter.get('/', listAgentsController);

// GET /api/agents/:type/capabilities - Get agent capabilities
agentsRouter.get('/:type/capabilities', getAgentCapabilitiesController);

export default agentsRouter;
