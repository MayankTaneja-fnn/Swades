import { generateText, streamText, convertToModelMessages, stepCountIs } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { conversationRepo } from "../repositories/conversationRepository";
import { chatRepo } from "../repositories/chatRepository";
import { extractUUID } from "../utils/uuidExtractor";
import { ChatMessage, ConversationContext, RoutingResult } from "../types/agentTypes";
import { orderTools } from "../tools/orderTools";
import { billingTools } from "../tools/billingTools";
import { supportTools } from "../tools/supportTools";

// Helper to extract plain text from message content
function getMessageText(message: ChatMessage): string {
    if (!message) return "";

    if (typeof message.content === "string") return message.content;

    if (Array.isArray(message.content)) {
        return message.content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("\n");
    }

    return "";
}

const FAST_MODEL = "llama-3.1-8b-instant";

// ✅ IMPROVEMENT 1: Strict Routing Schema with Confidence
const routingSchema = z.object({
    intent: z.enum(["ORDER", "BILLING", "SUPPORT"]),
    confidence: z.number().min(0).max(1),
    reason: z.string()
});

// ✅ IMPROVEMENT 2: Conversation Context Builder
function buildConversationContext(messages: ChatMessage[]): ConversationContext {
    // Get last 5 messages
    const lastMessages = messages
        .slice(-5)
        .map(m => `${m.role}: ${getMessageText(m)}`);

    // ✅ Extract last mentioned orderId using utility function
    let lastOrderId: string | undefined;

    for (let i = messages.length - 1; i >= 0; i--) {
        const text = getMessageText(messages[i]);
        const extracted = extractUUID(text);
        if (extracted) {
            lastOrderId = extracted;
            break;
        }
    }

    // Determine last issue type from conversation
    const conversationText = messages.map(m => getMessageText(m)).join(" ").toUpperCase();
    let lastIssueType: string | undefined;

    if (conversationText.includes("REFUND") || conversationText.includes("BILLING")) {
        lastIssueType = "BILLING";
    } else if (conversationText.includes("ORDER") || conversationText.includes("TRACK")) {
        lastIssueType = "ORDER";
    }

    return { lastMessages, lastOrderId, lastIssueType };
}

// ------------------ IMPROVED ROUTER WITH CONFIDENCE ------------------ //
async function routeWithConfidence(
    userText: string,
    context: ConversationContext
): Promise<{ intent: string; confidence: number; reason: string }> {
    try {
        // Build context-aware prompt
        const contextInfo = [
            context.lastOrderId ? `Last mentioned Order ID: ${context.lastOrderId}` : null,
            context.lastIssueType ? `Previous issue type: ${context.lastIssueType}` : null,
            context.lastMessages.length > 1 ? `Recent conversation:\n${context.lastMessages.slice(-3).join('\n')}` : null
        ].filter(Boolean).join('\n');

        const prompt = `${contextInfo ? contextInfo + '\n\n' : ''}Current user message: ${userText}`;

        const { text } = await generateText({
            model: groq(FAST_MODEL),
            system: `You are a routing classifier. Analyze the user's message and classify it into one of these categories:
- ORDER: Questions about order status, tracking, delivery, shipment
- BILLING: Questions about invoices, payments, refunds, charges, money
- SUPPORT: General questions, account issues, or anything else

Return ONLY a JSON object with this exact format:
{
  "intent": "ORDER" | "BILLING" | "SUPPORT",
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation"
}`,
            prompt,
        });

        // Parse the JSON response
        const parsed = JSON.parse(text.trim());
        const validated = routingSchema.parse(parsed);

        console.log(`ROUTER: intent=${validated.intent}, confidence=${validated.confidence}, reason=${validated.reason}`);

        return validated;
    } catch (e) {
        console.error("Router model error:", e);
        // Fallback to SUPPORT with low confidence
        return {
            intent: "SUPPORT",
            confidence: 0.3,
            reason: "Router error, defaulting to support"
        };
    }
}

// Helper to ensure messages are in CoreMessage format for AI SDK
function normalizeMessages(messages: ChatMessage[]): any[] {
    return messages.map(m => {
        // AI SDK CoreMessage expects 'role' and 'content'
        // 'content' can be string or array of parts
        let normalizedContent = m.content;

        // If content is missing, use empty string
        if (normalizedContent === undefined || normalizedContent === null) {
            normalizedContent = "";
        }

        return {
            role: m.role || "user",
            content: normalizedContent
        };
    });
}

// ------------------ MAIN ROUTER FUNCTION ------------------ //
export async function routeAndProcess(
    messages: ChatMessage[],
    conversationId: string,
    onFinish?: (text: string, intent: string) => Promise<void>
): Promise<RoutingResult> {
    try {
        console.log("\n=== ROUTE AND PROCESS START ===");
        console.log("Messages received:", messages);
        console.log("Messages length:", messages?.length || 0);
        console.log("Messages is array:", Array.isArray(messages));

        // Validate messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error("ERROR: Invalid messages parameter!", messages);
            throw new Error("Messages parameter must be a non-empty array");
        }

        const lastMessage = messages[messages.length - 1];
        const userText = getMessageText(lastMessage);

        console.log(`ROUTING: "${userText.slice(0, 50)}..."`);

        // ✅ BONUS FEATURE: Context Compaction (check if > 20 messages)
        try {
            const compactionResult = await conversationRepo.compactConversation(conversationId);
            if (compactionResult.compacted) {
                console.log(`✅ Context compacted: ${compactionResult.summarizedCount} messages summarized`);
            }
        } catch (error) {
            console.error('Error during context compaction:', error);
        }

        // ✅ Build conversation context
        const context = buildConversationContext(messages);
        console.log("CONTEXT:", context);

        // ✅ Use LLM router with confidence
        const routing = await routeWithConfidence(userText, context);

        // ✅ BONUS FEATURE: Multi-Step Clarification for low confidence
        if (routing.confidence < 0.6) {
            console.log(`⚠️ Low confidence (${routing.confidence}), generating clarification question`);

            // Generate clarification question
            const clarificationQuestions = [
                "I want to help you with the right information. Are you asking about:\n• Order tracking or delivery status?\n• Billing, invoices, or refunds?\n• General account support?",
                "To assist you better, could you clarify if this is related to:\n• An existing order?\n• A payment or billing issue?\n• Something else?",
                "I'd like to route you to the right specialist. Is your question about:\n• Order status or shipment?\n• Payments or refunds?\n• General support?"
            ];

            const clarificationQuestion = clarificationQuestions[Math.floor(Math.random() * clarificationQuestions.length)];

            // Route to SUPPORT with clarification prompt
            routing.intent = "SUPPORT";
            console.log(`Routing to SUPPORT with clarification: "${clarificationQuestion}"`);
        }

        const intentUpper = routing.intent;
        console.log("FINAL ROUTER RESULT:", intentUpper, `(confidence: ${routing.confidence})`);

        // ✅ Update conversation summary in database
        try {
            await chatRepo.updateConversation(conversationId, {
                summary: JSON.stringify({
                    lastOrderId: context.lastOrderId,
                    lastIssueType: context.lastIssueType,
                    lastIntent: intentUpper,
                    lastConfidence: routing.confidence
                })
            } as any);
        } catch (error) {
            console.error("Failed to update conversation summary:", error);
        }

        // ✅ Select agent tools and system prompt
        let systemPrompt = "";
        let tools: any = {};

        if (intentUpper === "ORDER") {
            systemPrompt = `You are an Order Tracking Agent. Help users track orders, check delivery status, and provide shipping information.
Tools return JSON objects - use the structured data to provide helpful responses.`;
            tools = orderTools;
        } else if (intentUpper === "BILLING") {
            systemPrompt = `You are a Billing Support Agent. Assist with invoices, refunds, payment issues, and subscription management.
Tools return JSON objects - use the structured data to provide helpful responses.`;
            tools = billingTools;
        } else {
            systemPrompt = `You are a General Support Agent. Provide helpful assistance for general inquiries and route complex issues appropriately.
Tools return JSON objects - use the structured data to provide helpful responses.

IMPORTANT: You have access to conversation history tools. The current conversation ID is: ${conversationId}
- Use getConversationHistory to review past messages
- Use getLastOrderId to find previously mentioned order IDs
- Use getLastInvoice to retrieve invoice information from conversation context`;
            tools = supportTools;
        }

        // ------------------ CONVERT MESSAGES ------------------ //
        console.log("Normalizing messages for model...");
        const modelMessages = normalizeMessages(messages);
        console.log("Messages normalized successfully");

        // ------------------ STREAM RESPONSE WITH STATUS INDICATORS ------------------ //
        const result = streamText({
            model: groq(FAST_MODEL),
            system: `${systemPrompt}

IMPORTANT: Tool results are JSON objects. Parse them and provide natural, friendly responses.
ALWAYS provide a friendly final response to the user based on tool results.
DO NOT leave the response empty.`,
            messages: modelMessages,
            tools,
            stopWhen: stepCountIs(5),
            // maxSteps: 5,

            // ✅ BONUS FEATURE: Streaming Status Indicators
            onStepFinish: async (step: any) => {
                console.log("STEP FINISHED:", step);

                if (step.toolCalls?.length) {
                    // ✅ Emit "tool_running" status
                    console.log("STATUS: tool_running");
                    console.log(
                        "TOOL CALLS DETECTED:",
                        step.toolCalls.map((tc: any) => tc.toolName)
                    );
                }

                if (step.toolResults?.length) {
                    console.log("TOOL RESULTS RECEIVED:", step.toolResults.length);
                    // ✅ Emit "generating_response" status after tools complete
                    console.log("STATUS: generating_response");
                }

                if (!step.toolCalls?.length && !step.toolResults?.length) {
                    // ✅ Emit "agent_thinking" status when no tools are involved
                    console.log("STATUS: agent_thinking");
                }
            },

            onFinish: async (event: any) => {
                const finalContent = event.text || "";
                console.log(`STREAM FINISHED. Final Text Length: ${finalContent.length}`);

                if (onFinish) await onFinish(finalContent, intentUpper);
            },
        });

        return { result, intent: intentUpper };
    } catch (error) {
        console.error("Agent Service Error:", error);
        throw error; // Rethrow to be caught by controller
    }
}
