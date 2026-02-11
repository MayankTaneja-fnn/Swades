import { chatRepo } from '../repositories/chatRepository.js';
import { conversationRepo } from '../repositories/conversationRepository.js';
import { userRepo } from '../repositories/userRepository.js';





export const createConversation = async (userId: string) => {

    if (userId === 'user-123-mock') {
        await userRepo.findOrCreateUser('mock@example.com', 'Mock User');
    }

    return chatRepo.createConversation(userId);
};

export const getConversation = async (id: string) => {
    return chatRepo.getConversationById(id);
};

export const getUserConversations = async (userId: string) => {
    return chatRepo.getUserConversations(userId);
};

export const deleteConversation = async (conversationId: string) => {

    return chatRepo.deleteConversation(conversationId);
};



export const saveMessage = async (
    conversationId: string,
    role: string,
    content: string,
    intent?: string
) => {
    try {

        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }


        const conversation = await chatRepo.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }


        const message = await chatRepo.createMessage(conversationId, role, content, intent);


        await chatRepo.updateConversation(conversationId, {
            updatedAt: new Date(),
        });

        return message;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
};

export const getConversationHistory = async (conversationId: string) => {

    return chatRepo.getMessagesByConversationId(conversationId);
};

export const getRecentMessages = async (conversationId: string, limit: number = 10) => {

    const validLimit = Math.min(Math.max(limit, 1), 100);
    return chatRepo.getRecentMessages(conversationId, validLimit);
};



export const shouldCompactConversation = async (conversationId: string): Promise<boolean> => {
    const messageCount = await chatRepo.getMessageCount(conversationId);
    return messageCount > 20;
};

export const compactConversationIfNeeded = async (conversationId: string) => {
    const shouldCompact = await shouldCompactConversation(conversationId);

    if (shouldCompact) {
        return conversationRepo.compactConversation(conversationId);
    }

    return { compacted: false };
};
