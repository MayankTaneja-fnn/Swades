import { prisma } from '../lib/db.js';


export class ConversationRepository {
    async getConversationHistory(conversationId: string) {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                intent: true,
                createdAt: true,
            },
        });
        return messages;
    }

    async getLastOrderId(conversationId: string): Promise<string | null> {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

        for (const message of messages) {
            const match = message.content.match(uuidRegex);
            if (match) {
                return match[0];
            }
        }

        return null;
    }

    async getLastInvoice(conversationId: string) {
        const lastOrderId = await this.getLastOrderId(conversationId);

        if (!lastOrderId) {
            return null;
        }

        const invoice = await prisma.invoice.findFirst({
            where: { orderId: lastOrderId },
        });

        return invoice;
    }

    async updateConversationSummary(conversationId: string, summary: any) {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { summary: JSON.stringify(summary) } as any,
        });
    }

    async getConversationSummary(conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { summary: true } as any,
        });

        if ((conversation as any)?.summary) {
            try {
                return JSON.parse((conversation as any).summary);
            } catch {
                return null;
            }
        }

        return null;
    }


    async compactConversation(conversationId: string) {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });

        const messageCount = messages.length;

        if (messageCount <= 20) {
            return { compacted: false, messageCount };
        }


        const messagesToKeep = messages.slice(-5);
        const messagesToSummarize = messages.slice(0, -5);


        const summary = {
            totalMessages: messagesToSummarize.length,
            dateRange: {
                start: messagesToSummarize[0]?.createdAt,
                end: messagesToSummarize[messagesToSummarize.length - 1]?.createdAt,
            },
            topics: this.extractTopics(messagesToSummarize),
            keyPoints: messagesToSummarize
                .filter(m => m.role === 'user')
                .map(m => m.content.substring(0, 100))
                .slice(0, 5),
        };


        await this.updateConversationSummary(conversationId, summary);


        const messageIdsToDelete = messagesToSummarize.map(m => m.id);
        await prisma.message.deleteMany({
            where: {
                id: { in: messageIdsToDelete },
            },
        });



        return {
            compacted: true,
            messageCount,
            summarizedCount: messagesToSummarize.length,
            keptCount: messagesToKeep.length,
            summary,
        };
    }

    private extractTopics(messages: any[]): string[] {
        const topics = new Set<string>();
        const keywords = ['order', 'billing', 'refund', 'invoice', 'delivery', 'cancel', 'subscription'];

        messages.forEach(msg => {
            const content = msg.content.toLowerCase();
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });

        return Array.from(topics);
    }
}

export const conversationRepo = new ConversationRepository();
