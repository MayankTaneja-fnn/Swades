import { Hono } from 'hono';
import { listAgentsController, getAgentCapabilitiesController } from '../controllers/agentController.js';

const agentsRouter = new Hono();


agentsRouter.get('/', listAgentsController);


agentsRouter.get('/:type/capabilities', getAgentCapabilitiesController);

export default agentsRouter;
