// Agent capabilities configuration
export interface AgentCapability {
    type: 'ORDER' | 'BILLING' | 'SUPPORT';
    tools: string[];
    description: string;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
    {
        type: 'ORDER',
        tools: ['trackOrder', 'cancelOrder', 'updateDeliveryAddress'],
        description: 'Handles order tracking, delivery status, shipment information, cancellations, and address modifications',
    },
    {
        type: 'BILLING',
        tools: ['getInvoice', 'processRefund', 'checkRefundStatus', 'getSubscription'],
        description: 'Handles invoices, payments, refunds, refund status checks, and subscription management',
    },
    {
        type: 'SUPPORT',
        tools: ['searchKnowledgeBase', 'getConversationHistory', 'getLastOrderId', 'getLastInvoice'],
        description: 'Handles general questions, account issues, and provides comprehensive support with conversation context',
    },
];

export function getAgentCapabilities(type?: string) {
    if (!type) {
        return AGENT_CAPABILITIES;
    }
    return AGENT_CAPABILITIES.find(agent => agent.type.toUpperCase() === type.toUpperCase());
}
