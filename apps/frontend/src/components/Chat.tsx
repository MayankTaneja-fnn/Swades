import { useChat } from "@ai-sdk/react";
import { type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function Chat() {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);

    const { messages, sendMessage, status, setMessages } = useChat({
        api: "/api/chat/messages",
        onError: (error: any) => {
            console.error("Chat Error:", error);
        },
        onFinish: () => {
            setTimeout(fetchConversations, 500);
        },
    } as any);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversation list
    const fetchConversations = async () => {
        try {
            const response = await fetch("/api/chat/conversations");
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        }
    };

    // Load a specific conversation
    const loadConversation = async (id: string) => {
        try {
            const response = await fetch(`/api/chat/conversations/${id}`);

            if (response.ok) {
                const data = await response.json();

                const formatted: UIMessage[] = data.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    parts: [{ type: "text", text: m.content }],
                    annotations: m.intent
                        ? [{ type: "intent", value: m.intent }]
                        : [],
                }));

                setConversationId(id);
                localStorage.setItem("active_conversation_id", id);
                setMessages(formatted);
            } else if (response.status === 404) {
                console.warn("Conversation not found, creating new one...");
                await handleCreateNewChat();
            }
        } catch (error) {
            console.error("Failed to load conversation:", error);
        } finally {
            setIsInitialized(true);
        }
    };

    const handleCreateNewChat = async () => {
        try {
            const response = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            setConversationId(data.id);
            localStorage.setItem("active_conversation_id", data.id);

            setMessages([]);
            await fetchConversations();
        } catch (error) {
            console.error("Failed to create conversation:", error);
        } finally {
            setIsInitialized(true);
        }
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure?")) return;

        try {
            const response = await fetch(`/api/chat/conversations/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                if (id === conversationId) {
                    setIsInitialized(false);
                    setConversationId(null);
                    localStorage.removeItem("active_conversation_id");
                    await handleCreateNewChat();
                } else {
                    await fetchConversations();
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    // Initial load
    useEffect(() => {
        const initializeChat = async () => {
            await fetchConversations();

            const savedId = localStorage.getItem("active_conversation_id");

            if (savedId) {
                await loadConversation(savedId);
            } else {
                await handleCreateNewChat();
            }
        };

        initializeChat();
    }, []);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Ensure we have a conversation ID before sending
        let currentConversationId = conversationId;
        if (!currentConversationId) {
            try {
                // If no conversation, create one first
                const response = await fetch("/api/chat/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    currentConversationId = data.id;
                    setConversationId(data.id);
                    localStorage.setItem("active_conversation_id", data.id);
                } else {
                    console.error("Failed to create new conversation automatically");
                    return; // Stop if we can't create a conversation
                }
            } catch (error) {
                console.error("Error creating conversation:", error);
                return;
            }
        }

        const currentInput = input;
        setInput("");

        try {
            await sendMessage(
                { text: currentInput },
                { body: { conversationId: currentConversationId } }
            );
        } catch (error) {
            console.error("Failed to send message:", error);
            // Restore input on error, but only if it's not a 404 which we now handle better 
            // actually let's just restore it for safety
            setInput(currentInput);
        }
    };


    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setInput(e.target.value);
    };

    const isLoading = status === "submitted" || status === "streaming";

    if (!isInitialized) {
        return (
            <div className="flex h-screen bg-white items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={handleCreateNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="py-2">
                        {conversations.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => loadConversation(chat.id)}
                                className={`group flex items-center justify-between px-3 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${conversationId === chat.id
                                    ? "bg-gray-200 font-medium"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <span className="truncate text-sm text-gray-700">
                                    {chat.messages?.[0]?.content || "Empty chat"}
                                </span>

                                <button
                                    onClick={(e) => handleDeleteConversation(chat.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">AI Support Hub</h1>
                        {conversationId && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                ID: {conversationId.slice(0, 8)}...
                            </span>
                        )}
                    </div>

                    {isLoading && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                            AI is thinking...
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white min-h-0">
                    <div className="max-w-4xl mx-auto h-full w-full">
                        <MessageList messages={messages} isLoading={isLoading} />
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
                    <MessageInput
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading || !conversationId}
                    />
                </div>
            </main>
        </div>
    );
}
