import { z } from 'zod';

export const MessageSchema = z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    createdAt: z.string()
});

export type Message = z.infer<typeof MessageSchema>;
