import { Context } from 'hono';
import { routeAndProcess } from '../services/agentService.js';
import { saveMessage, getConversationHistory, createConversation, getUserConversations, deleteConversation, getConversation } from '../services/chatService.js';
import { prisma } from '../lib/db.js';

export const getConversationsController = async (c: Context) => {
    // TODO: Get userId from auth context
    const userId = 'user-123-mock'; // Mock user
    const conversations = await getUserConversations(userId);
    return c.json(conversations);
};

export const getConversationController = async (c: Context) => {
    const id = c.req.param('id');
    const conversation = await getConversation(id);
    if (!conversation) {
        return c.json({ error: 'Conversation not found' }, 404);
    }
    const messages = await getConversationHistory(id);
    return c.json(messages);
};

export const createConversationController = async (c: Context) => {
    const userId = 'user-123-mock';
    const conversation = await createConversation(userId);
    return c.json(conversation);
};

export const sendMessageController = async (c: Context) => {
    try {
        const body = await c.req.json();


        const { conversationId, messages } = body;

        if (!conversationId) {
            console.error('Missing conversationId in request');
            return c.json({ error: 'Conversation ID required' }, 400);
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error('Invalid messages array:', messages);
            return c.json({ error: 'Messages array required' }, 400);
        }


        const lastMessage = messages[messages.length - 1];




        let messageContent = '';
        if (typeof lastMessage.content === 'string') {
            messageContent = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {

            messageContent = lastMessage.content
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('\n');
        } else if (lastMessage.parts) {
            for (const part of lastMessage.parts) {
                if (part.type === 'text') {
                    messageContent += part.text;
                }
            }
        } else if (lastMessage.text) {
            messageContent = lastMessage.text;
        }



        if (!messageContent || messageContent.trim().length === 0) {
            console.error('Empty message content');
            return c.json({ error: 'Message content required' }, 400);
        }


        const conversation = await getConversation(conversationId);
        if (!conversation) {
            console.error('Conversation not found:', conversationId);
            return c.json({ error: 'Conversation not found. Please create a new chat.' }, 404);
        }


        await saveMessage(conversationId, 'user', messageContent);


        const history = await getConversationHistory(conversationId);


        if (!history || !Array.isArray(history)) {
            console.error('Invalid history returned:', history);
            return c.json({ error: 'Failed to retrieve conversation history' }, 500);
        }




        const coreMessages = history.map((m: any) => ({
            role: m.role,
            content: m.content || ""
        }));


        const routeResult = await routeAndProcess(coreMessages, conversationId, async (text: string, intent: string) => {

            await saveMessage(conversationId, 'assistant', text, intent);
        });


        if (!routeResult || !routeResult.result) {
            console.error('Invalid route result:', routeResult);
            return c.json({ error: 'Failed to process message' }, 500);
        }

        const { result, intent } = routeResult;





        const response = result.toUIMessageStreamResponse({
            headers: {
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Intent': intent
            },
            messageMetadata: () => ({ intent })
        });

        return response;
    } catch (error) {
        console.error("CRITICAL STREAM ERROR:", error);
        console.error("Error stack:", (error as any).stack);
        return c.json({ error: 'Internal Server Error', details: (error as any).message }, 500);
    }
};

export const deleteConversationController = async (c: Context) => {
    const id = c.req.param('id');
    try {
        await deleteConversation(id);
        return c.json({ success: true });
    } catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to delete conversation' }, 500);
    }
};
