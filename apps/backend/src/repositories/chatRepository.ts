import { prisma } from '../lib/db.js';


export class ChatRepository {


    async createConversation(userId: string) {

        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: `${userId}@mock.example.com`,
                name: 'Mock User'
            }
        });

        return prisma.conversation.create({
            data: { userId },
        });
    }

    async getConversationById(id: string) {
        return prisma.conversation.findUnique({
            where: { id },
        });
    }

    async getUserConversations(userId: string) {
        return prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    async updateConversation(id: string, data: any) {
        return prisma.conversation.update({
            where: { id },
            data,
        });
    }

    async deleteConversation(conversationId: string) {

        await prisma.message.deleteMany({
            where: { conversationId },
        });

        return prisma.conversation.delete({
            where: { id: conversationId },
        });
    }



    async createMessage(conversationId: string, role: string, content: string, intent?: string) {
        return prisma.message.create({
            data: {
                conversationId,
                role,
                content,
                intent,
            } as any,
        });
    }

    async getMessagesByConversationId(conversationId: string) {
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getRecentMessages(conversationId: string, limit: number) {
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async deleteMessagesByConversationId(conversationId: string) {
        return prisma.message.deleteMany({
            where: { conversationId },
        });
    }

    async getMessageCount(conversationId: string): Promise<number> {
        return prisma.message.count({
            where: { conversationId },
        });
    }
}

export const chatRepo = new ChatRepository();
