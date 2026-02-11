import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { InvoiceToolResult, RefundToolResult, RefundStatusResult, SubscriptionResult } from "../types/agentTypes.js";

export const billingTools = {
    getInvoice: tool({
        description: "Get invoice details using the associated Order UUID or the Invoice UUID directly",
        inputSchema: z.object({
            orderId: z.string().optional().describe("The associated Order UUID string"),
            invoiceId: z.string().optional().describe("The Invoice UUID string"),
        }),
        execute: async ({ orderId, invoiceId }: { orderId?: string; invoiceId?: string }): Promise<InvoiceToolResult> => {
            try {


                if (!orderId && !invoiceId) {
                    return {
                        found: false,
                        orderId: "unknown",
                        error: "Please provide either an Order ID or an Invoice ID."
                    };
                }

                let invoice;

                if (invoiceId) {
                    invoice = await prisma.invoice.findUnique({
                        where: { id: invoiceId },
                    });
                } else if (orderId) {
                    invoice = await prisma.invoice.findFirst({
                        where: { orderId },
                    });
                }

                if (invoice) {
                    return {
                        found: true,
                        invoiceId: invoice.id,
                        amount: invoice.amount,
                        status: invoice.status,
                        dueDate: invoice.dueDate.toISOString(),
                        orderId: invoice.orderId
                    };
                } else {
                    return {
                        found: false,
                        orderId: orderId || "unknown",
                        error: "Invoice not found."
                    };
                }
            } catch (error) {
                console.error("Tool ERROR (getInvoice):", error);
                return {
                    found: false,
                    orderId: orderId || "unknown",
                    error: "Error accessing billing database."
                };
            }
        },
    }),

    processRefund: tool({
        description: "Process a refund for an order",
        inputSchema: z.object({
            orderId: z.string(),
            reason: z.string(),
        }),
        execute: async ({
            orderId,
            reason,
        }: {
            orderId: string;
            reason: string;
        }): Promise<RefundToolResult> => {

            return {
                success: true,
                orderId,
                reason,
                message: `Refund request has been logged and will be processed within 3-5 business days.`
            };
        },
    }),

    checkRefundStatus: tool({
        description: "Check the status of an existing refund request for an order",
        inputSchema: z.object({
            orderId: z.string().describe("The Order UUID for the refund"),
        }),
        execute: async ({ orderId }: { orderId: string }): Promise<RefundStatusResult> => {
            try {
                if (!orderId || orderId === "undefined") {
                    return {
                        found: false,
                        orderId,
                        message: "No Order ID provided.",
                        error: "Please provide a valid Order ID."
                    };
                }




                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    return {
                        found: false,
                        orderId,
                        message: "Order not found.",
                        error: "Cannot check refund status for non-existent order."
                    };
                }


                const mockStatuses = ["PENDING", "PROCESSING", "APPROVED", "COMPLETED"];
                const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

                const statusMessages: Record<string, string> = {
                    PENDING: "Your refund request is pending review. Expected processing time: 2-3 business days.",
                    PROCESSING: "Your refund is being processed. Expected completion: 3-5 business days.",
                    APPROVED: "Your refund has been approved and will be credited within 2 business days.",
                    COMPLETED: "Your refund has been completed and credited to your original payment method."
                };

                return {
                    found: true,
                    orderId,
                    status: randomStatus,
                    amount: 99.99,
                    processedDate: new Date().toISOString(),
                    estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    message: statusMessages[randomStatus]
                };
            } catch (error) {
                console.error("Tool ERROR (checkRefundStatus):", error);
                return {
                    found: false,
                    orderId,
                    message: "Error checking refund status.",
                    error: "An error occurred while retrieving refund information."
                };
            }
        },
    }),

    getSubscription: tool({
        description: "Get subscription details for a user",
        inputSchema: z.object({
            userId: z.string().describe("The User ID"),
        }),
        execute: async ({ userId }: { userId: string }): Promise<SubscriptionResult> => {
            try {
                if (!userId || userId === "undefined") {
                    return {
                        found: false,
                        userId,
                        message: "No User ID provided.",
                        error: "Please provide a valid User ID."
                    };
                }




                const user = await prisma.user.findUnique({
                    where: { id: userId },
                });

                if (!user) {
                    return {
                        found: false,
                        userId,
                        message: "User not found.",
                        error: "Cannot retrieve subscription for non-existent user."
                    };
                }


                const mockPlans = ["BASIC", "PREMIUM", "ENTERPRISE"];
                const mockPlan = mockPlans[Math.floor(Math.random() * mockPlans.length)];
                const mockAmounts = { BASIC: 9.99, PREMIUM: 19.99, ENTERPRISE: 49.99 };

                return {
                    found: true,
                    userId,
                    subscriptionId: `SUB-${Date.now()}`,
                    plan: mockPlan,
                    status: "ACTIVE",
                    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: mockAmounts[mockPlan as keyof typeof mockAmounts],
                    message: `Active ${mockPlan} subscription. Next renewal: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                };
            } catch (error) {
                console.error("Tool ERROR (getSubscription):", error);
                return {
                    found: false,
                    userId,
                    message: "Error retrieving subscription.",
                    error: "An error occurred while fetching subscription details."
                };
            }
        },
    }),
};

