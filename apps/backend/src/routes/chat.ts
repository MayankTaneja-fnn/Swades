import { Hono } from 'hono';
import {
    getConversationsController,
    getConversationController,
    createConversationController,
    sendMessageController,
    deleteConversationController
} from '../controllers/chatController.js';

const chatRouter = new Hono();


chatRouter.get('/conversations', getConversationsController);


chatRouter.get('/conversations/:id', getConversationController);


chatRouter.post('/conversations', createConversationController);


chatRouter.post('/messages', sendMessageController);

chatRouter.post('/', sendMessageController);


chatRouter.delete('/conversations/:id', deleteConversationController);

export default chatRouter;
