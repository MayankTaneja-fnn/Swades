import { chatRepo } from '../repositories/chatRepository.js';
import { conversationRepo } from '../repositories/conversationRepository.js';
import { userRepo } from '../repositories/userRepository.js';

/**
 * Service layer for chat business logic
 * Uses repositories for data access, contains business rules
 */

// ========== Conversation Business Logic ==========

export const createConversation = async (userId: string) => {
    // Business logic: Ensure user exists (for mock user scenario)
    // In production, this would be handled by authentication middleware
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
    // Business logic: Could add authorization checks here
    // Could trigger cleanup tasks, notifications, etc.
    return chatRepo.deleteConversation(conversationId);
};

// ========== Message Business Logic ==========

export const saveMessage = async (
    conversationId: string,
    role: string,
    content: string,
    intent?: string
) => {
    try {
        // Business logic: Validate message content
        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }

        // Business logic: Check if conversation exists
        const conversation = await chatRepo.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Save message via repository
        const message = await chatRepo.createMessage(conversationId, role, content, intent);

        // Business logic: Update conversation timestamp
        await chatRepo.updateConversation(conversationId, {
            updatedAt: new Date(),
        });

        return message;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error; // Re-throw to be caught by controller
    }
};

export const getConversationHistory = async (conversationId: string) => {
    // Business logic: Could add pagination, filtering, etc.
    return chatRepo.getMessagesByConversationId(conversationId);
};

export const getRecentMessages = async (conversationId: string, limit: number = 10) => {
    // Business logic: Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
    return chatRepo.getRecentMessages(conversationId, validLimit);
};

// ========== Context Management ==========

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
