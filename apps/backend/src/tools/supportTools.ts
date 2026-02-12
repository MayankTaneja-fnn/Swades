import { tool } from "ai";
import { z } from "zod";
import { conversationRepo } from "../repositories/conversationRepository.js";
import { KnowledgeBaseResult, ConversationHistoryResult, OrderIdResult, InvoiceResult } from "../types/agentTypes.js";

export const createSupportTools = (databaseUrl: string) => ({
    searchKnowledgeBase: tool({
        description: "Search help docs",
        inputSchema: z.object({
            query: z.string(),
        }),
        execute: async ({ query }: { query: string }): Promise<KnowledgeBaseResult> => {
            return {
                found: false,
                query,
                suggestion: "Please contact live support for personalized assistance."
            };
        },
    }),

    getConversationHistory: tool({
        description: "Get the full conversation history for context",
        inputSchema: z.object({
            conversationId: z.string().describe("The conversation ID"),
        }),
        execute: async ({ conversationId }: { conversationId: string }): Promise<ConversationHistoryResult> => {
            try {
                const history = await conversationRepo.getConversationHistory(databaseUrl, conversationId);
                return {
                    found: true,
                    messageCount: history.length,
                    messages: history.map(m => ({
                        role: m.role,
                        content: m.content.substring(0, 200),
                        intent: m.intent,
                    })),
                };
            } catch (error) {
                return {
                    found: false,
                    error: "Failed to retrieve conversation history",
                };
            }
        },
    }),

    getLastOrderId: tool({
        description: "Extract the last mentioned Order ID from conversation history",
        inputSchema: z.object({
            conversationId: z.string().describe("The conversation ID"),
        }),
        execute: async ({ conversationId }: { conversationId: string }): Promise<OrderIdResult> => {
            try {
                const orderId = await conversationRepo.getLastOrderId(databaseUrl, conversationId);
                return {
                    found: !!orderId,
                    orderId: orderId || undefined,
                    message: orderId
                        ? `Last mentioned Order ID: ${orderId}`
                        : "No Order ID found in conversation history",
                };
            } catch (error) {
                return {
                    found: false,
                    message: "Failed to extract Order ID",
                    error: "Failed to extract Order ID",
                };
            }
        },
    }),

    getLastInvoice: tool({
        description: "Get the invoice for the last mentioned order in conversation",
        inputSchema: z.object({
            conversationId: z.string().describe("The conversation ID"),
        }),
        execute: async ({ conversationId }: { conversationId: string }): Promise<InvoiceResult> => {
            try {
                const invoice = await conversationRepo.getLastInvoice(databaseUrl, conversationId);
                if (invoice) {
                    return {
                        found: true,
                        invoiceId: invoice.id,
                        amount: invoice.amount,
                        status: invoice.status,
                        dueDate: invoice.dueDate.toISOString(),
                        orderId: invoice.orderId,
                    };
                }
                return {
                    found: false,
                    message: "No invoice found for recent orders in conversation",
                };
            } catch (error) {
                return {
                    found: false,
                    error: "Failed to retrieve invoice",
                };
            }
        },
    }),
});
