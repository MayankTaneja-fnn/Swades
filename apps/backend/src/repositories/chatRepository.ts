import { getPrisma } from '../lib/db.js';


export class ChatRepository {


    async createConversation(databaseUrl: string, userId: string) {
        const prisma = getPrisma(databaseUrl);

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

    async getConversationById(databaseUrl: string, id: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.conversation.findUnique({
            where: { id },
        });
    }

    async getUserConversations(databaseUrl: string, userId: string) {
        const prisma = getPrisma(databaseUrl);
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

    async updateConversation(databaseUrl: string, id: string, data: any) {
        const prisma = getPrisma(databaseUrl);
        return prisma.conversation.update({
            where: { id },
            data,
        });
    }

    async deleteConversation(databaseUrl: string, conversationId: string) {
        const prisma = getPrisma(databaseUrl);

        await prisma.message.deleteMany({
            where: { conversationId },
        });

        return prisma.conversation.delete({
            where: { id: conversationId },
        });
    }



    async createMessage(databaseUrl: string, conversationId: string, role: string, content: string, intent?: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.message.create({
            data: {
                conversationId,
                role,
                content,
                intent,
            } as any,
        });
    }

    async getMessagesByConversationId(databaseUrl: string, conversationId: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getRecentMessages(databaseUrl: string, conversationId: string, limit: number) {
        const prisma = getPrisma(databaseUrl);
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async deleteMessagesByConversationId(databaseUrl: string, conversationId: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.message.deleteMany({
            where: { conversationId },
        });
    }

    async getMessageCount(databaseUrl: string, conversationId: string): Promise<number> {
        const prisma = getPrisma(databaseUrl);
        return prisma.message.count({
            where: { conversationId },
        });
    }
}

export const chatRepo = new ChatRepository();
