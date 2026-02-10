import React from 'react';

interface MessageInputProps {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

export default function MessageInput({ input, handleInputChange, handleSubmit, isLoading }: MessageInputProps) {
    return (
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
            <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
                Send
            </button>
        </form>
    );
}
