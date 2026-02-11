import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { OrderToolResult, CancelOrderResult, UpdateAddressResult } from "../types/agentTypes.js";

export const orderTools = {
    trackOrder: tool({
        description:
            "Get tracking status of an order using its exact UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)",
        inputSchema: z.object({
            orderId: z.string().describe("The full Order UUID string"),
        }),
        execute: async ({ orderId }: { orderId: string }): Promise<OrderToolResult> => {
            try {
                if (!orderId || orderId === "undefined") {
                    return {
                        found: false,
                        orderId,
                        error: "No Order ID provided. Please ask the user for the Order ID."
                    };
                }

                console.log(`Tool EXECUTE: trackOrder for ${orderId}`);

                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (order) {
                    return {
                        found: true,
                        status: order.status,
                        deliveryDate: order.deliveryDate?.toISOString(),
                        orderId: order.id
                    };
                } else {
                    return {
                        found: false,
                        orderId,
                        error: "Order not found in database. Please check the ID and try again."
                    };
                }
            } catch (error) {
                console.error("Tool ERROR (trackOrder):", error);
                return {
                    found: false,
                    orderId,
                    error: "Error accessing order database. Check if the Order ID is a valid UUID."
                };
            }
        },
    }),

    cancelOrder: tool({
        description: "Cancel an existing order. Returns cancellation confirmation.",
        inputSchema: z.object({
            orderId: z.string().describe("The Order UUID to cancel"),
        }),
        execute: async ({ orderId }: { orderId: string }): Promise<CancelOrderResult> => {
            try {
                if (!orderId || orderId === "undefined") {
                    return {
                        success: false,
                        orderId,
                        message: "No Order ID provided.",
                        error: "Please provide a valid Order ID."
                    };
                }

                console.log(`Tool EXECUTE: cancelOrder for ${orderId}`);

                // Check if order exists
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    return {
                        success: false,
                        orderId,
                        message: "Order not found.",
                        error: "Cannot cancel an order that doesn't exist."
                    };
                }

                if (order.status === "DELIVERED") {
                    return {
                        success: false,
                        orderId,
                        message: "Cannot cancel delivered order.",
                        error: "This order has already been delivered. Please request a refund instead."
                    };
                }

                // Mock cancellation (in production, update order status)
                const cancellationId = `CXL-${Date.now()}`;

                return {
                    success: true,
                    orderId,
                    cancellationId,
                    message: `Order ${orderId} has been successfully cancelled. Cancellation ID: ${cancellationId}. Refund will be processed within 5-7 business days.`
                };
            } catch (error) {
                console.error("Tool ERROR (cancelOrder):", error);
                return {
                    success: false,
                    orderId,
                    message: "Error cancelling order.",
                    error: "An error occurred while processing the cancellation."
                };
            }
        },
    }),

    updateDeliveryAddress: tool({
        description: "Update the delivery address for an order that hasn't shipped yet.",
        inputSchema: z.object({
            orderId: z.string().describe("The Order UUID"),
            newAddress: z.string().describe("The new delivery address"),
        }),
        execute: async ({ orderId, newAddress }: { orderId: string; newAddress: string }): Promise<UpdateAddressResult> => {
            try {
                if (!orderId || orderId === "undefined") {
                    return {
                        success: false,
                        orderId,
                        newAddress,
                        message: "No Order ID provided.",
                        error: "Please provide a valid Order ID."
                    };
                }

                if (!newAddress || newAddress.trim().length < 10) {
                    return {
                        success: false,
                        orderId,
                        newAddress,
                        message: "Invalid address.",
                        error: "Please provide a complete delivery address."
                    };
                }

                console.log(`Tool EXECUTE: updateDeliveryAddress for ${orderId}`);

                // Check if order exists
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    return {
                        success: false,
                        orderId,
                        newAddress,
                        message: "Order not found.",
                        error: "Cannot update address for non-existent order."
                    };
                }

                if (order.status === "SHIPPED" || order.status === "DELIVERED") {
                    return {
                        success: false,
                        orderId,
                        newAddress,
                        message: "Cannot update address.",
                        error: `Order is already ${order.status.toLowerCase()}. Address changes are not possible.`
                    };
                }

                // Mock address update (in production, update order record)
                return {
                    success: true,
                    orderId,
                    newAddress,
                    message: `Delivery address updated successfully to: ${newAddress}. The change will be reflected in your next shipment update.`
                };
            } catch (error) {
                console.error("Tool ERROR (updateDeliveryAddress):", error);
                return {
                    success: false,
                    orderId,
                    newAddress,
                    message: "Error updating address.",
                    error: "An error occurred while updating the delivery address."
                };
            }
        },
    }),
};

