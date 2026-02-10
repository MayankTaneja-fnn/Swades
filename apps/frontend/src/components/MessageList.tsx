import type { UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

const getAgentLabel = (intent?: string) => {
  switch (intent) {
    case "ORDER":
      return "Order Specialist";
    case "BILLING":
      return "Billing Analyst";
    case "SUPPORT":
      return "Support Specialist";
    default:
      return "AI Assistant";
  }
};

// Extract text properly from AI SDK v6 message.parts
const getMessageText = (m: UIMessage) => {
  if ((m as any).content && typeof (m as any).content === "string") {
    return (m as any).content;
  }

  const parts = (m as any).parts;

  if (!parts || !Array.isArray(parts)) return "";

  return parts
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("\n");
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-full mb-6 shadow-sm">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">
          Welcome to AI Support Hub
        </p>
        <p className="text-sm text-gray-500">How can I assist you today?</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {messages.map((m) => {
        const messageText = getMessageText(m);

        return (
          <div
            key={m.id}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ${m.role === "user"
                ? "bg-blue-600 text-white rounded-[24px]"
                : "bg-white text-gray-800 border border-gray-100 rounded-[24px]"
                }`}
            >
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {messageText || (
                  <span className="text-gray-400 italic">(empty message)</span>
                )}
              </div>

              {m.role === "assistant" && (
                <div className="text-[11px] font-semibold text-gray-400 mt-2 flex items-center gap-1.5 border-t border-gray-50 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {getAgentLabel(
                    (m as any).annotations?.find((a: any) => a.type === "intent")
                      ?.value ||
                    (m as any).messageMetadata?.intent ||
                    (m as any).metadata?.intent ||
                    (m as any).intent
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Thinking Indicator */}
      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <div className="flex w-full justify-start">
          <div className="px-5 py-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-white border border-gray-100 rounded-[24px] rounded-tl-none">
            <div className="flex space-x-1.5 items-center h-6">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
