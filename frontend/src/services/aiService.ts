import api from './api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isCommand?: boolean;
    action?: string;
    target?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
}

export interface AiResponse {
    response: string;
    isCommand: boolean;
    action?: string;
    target?: string;
    message?: string;
}

class AiService {
    /**
     * Send a message to the AI assistant
     */
    async chat(message: string, chatId?: string): Promise<AiResponse> {
        const response = await api.post('/ai/chat', { message, chatId });
        return response.data;
    }

    /**
     * Trigger metadata sync (admin only)
     */
    async syncMetadata(): Promise<string> {
        const response = await api.post('/ai/sync-metadata');
        return response.data;
    }

    /**
     * Get current metadata cache (for debugging)
     */
    async getMetadata(): Promise<any> {
        const response = await api.get('/ai/metadata');
        return JSON.parse(response.data);
    }
}

export const aiService = new AiService();
export default aiService;
