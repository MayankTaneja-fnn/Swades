import { Hono } from 'hono';
import {
    getConversationsController,
    getConversationController,
    createConversationController,
    sendMessageController,
    deleteConversationController
} from '../controllers/chatController';

const chatRouter = new Hono();

// GET /api/chat/conversations - List conversations
chatRouter.get('/conversations', getConversationsController);

// GET /api/chat/conversations/:id - Get specific conversation
chatRouter.get('/conversations/:id', getConversationController);

// POST /api/chat/conversations - Create new conversation
chatRouter.post('/conversations', createConversationController);

// POST /api/chat/messages - Send message & Stream response
chatRouter.post('/messages', sendMessageController);
// POST /api/chat - Fallback for default SDK behavior
chatRouter.post('/', sendMessageController);

// DELETE /api/chat/conversations/:id - Delete conversation
chatRouter.delete('/conversations/:id', deleteConversationController);

export default chatRouter;
