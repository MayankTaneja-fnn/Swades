import { chatRepo } from '../repositories/chatRepository.js';
import { conversationRepo } from '../repositories/conversationRepository.js';
import { userRepo } from '../repositories/userRepository.js';





export const createConversation = async (databaseUrl: string, userId: string) => {

    if (userId === 'user-123-mock') {
        await userRepo.findOrCreateUser(databaseUrl, 'mock@example.com', 'Mock User');
    }

    return chatRepo.createConversation(databaseUrl, userId);
};

export const getConversation = async (databaseUrl: string, id: string) => {
    return chatRepo.getConversationById(databaseUrl, id);
};

export const getUserConversations = async (databaseUrl: string, userId: string) => {
    return chatRepo.getUserConversations(databaseUrl, userId);
};

export const deleteConversation = async (databaseUrl: string, conversationId: string) => {

    return chatRepo.deleteConversation(databaseUrl, conversationId);
};



export const saveMessage = async (
    databaseUrl: string,
    conversationId: string,
    role: string,
    content: string,
    intent?: string
) => {
    try {

        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }


        const conversation = await chatRepo.getConversationById(databaseUrl, conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }


        const message = await chatRepo.createMessage(databaseUrl, conversationId, role, content, intent);


        await chatRepo.updateConversation(databaseUrl, conversationId, {
            updatedAt: new Date(),
        });

        return message;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
};

export const getConversationHistory = async (databaseUrl: string, conversationId: string) => {

    return chatRepo.getMessagesByConversationId(databaseUrl, conversationId);
};

export const getRecentMessages = async (databaseUrl: string, conversationId: string, limit: number = 10) => {

    const validLimit = Math.min(Math.max(limit, 1), 100);
    return chatRepo.getRecentMessages(databaseUrl, conversationId, validLimit);
};



export const shouldCompactConversation = async (databaseUrl: string, conversationId: string): Promise<boolean> => {
    const messageCount = await chatRepo.getMessageCount(databaseUrl, conversationId);
    return messageCount > 20;
};

export const compactConversationIfNeeded = async (databaseUrl: string, conversationId: string) => {
    const shouldCompact = await shouldCompactConversation(databaseUrl, conversationId);

    if (shouldCompact) {
        return conversationRepo.compactConversation(databaseUrl, conversationId);
    }

    return { compacted: false };
};
