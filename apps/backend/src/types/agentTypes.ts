export type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: any;
};

export interface ConversationContext {
    lastMessages: string[];
    lastOrderId?: string;
    lastIssueType?: string;
}

export interface RoutingResult {
    result: any; // StreamTextResult from AI SDK
    intent: string;
}

// Tool result interfaces
export interface OrderToolResult {
    found: boolean;
    status?: string;
    deliveryDate?: string;
    orderId: string;
    error?: string;
}

export interface InvoiceToolResult {
    found: boolean;
    invoiceId?: string;
    amount?: number;
    status?: string;
    dueDate?: string;
    orderId: string;
    error?: string;
}

export interface RefundToolResult {
    success: boolean;
    orderId: string;
    reason: string;
    message: string;
}

export interface KnowledgeBaseResult {
    found: boolean;
    query: string;
    suggestion: string;
}

export interface ConversationHistoryResult {
    found: boolean;
    messageCount?: number;
    messages?: Array<{
        role: string;
        content: string;
        intent: string | null;
    }>;
    error?: string;
}

export interface OrderIdResult {
    found: boolean;
    orderId?: string;
    message: string;
    error?: string;
}

export interface InvoiceResult {
    found: boolean;
    invoiceId?: string;
    amount?: number;
    status?: string;
    dueDate?: string;
    orderId?: string;
    message?: string;
    error?: string;
}

// New tool result interfaces for bonus features
export interface CancelOrderResult {
    success: boolean;
    orderId: string;
    message: string;
    cancellationId?: string;
    error?: string;
}

export interface UpdateAddressResult {
    success: boolean;
    orderId: string;
    newAddress: string;
    message: string;
    error?: string;
}

export interface RefundStatusResult {
    found: boolean;
    orderId: string;
    status?: string;
    amount?: number;
    processedDate?: string;
    estimatedCompletion?: string;
    message: string;
    error?: string;
}

export interface SubscriptionResult {
    found: boolean;
    userId: string;
    subscriptionId?: string;
    plan?: string;
    status?: string;
    renewalDate?: string;
    amount?: number;
    message: string;
    error?: string;
}
