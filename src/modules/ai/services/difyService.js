/**
 * DifyService handles interactions with Dify AI Workflows.
 * Includes a fallback to mock data when API keys are missing.
 */
class DifyService {
    constructor() {
        this.baseUrl = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
    }

    /**
     * Calls a specific Dify Workflow.
     * Fallbacks to mock data if apiKey is not provided.
     */
    async callWorkflow(apiKey, inputs, userIdentifier, conversationId = null) {
        if (!apiKey) {
            console.log('Skipping Dify call: No API Key provided. Returning mock data.');
            return this.getMockResponse(inputs);
        }

        try {
            const response = await fetch(`${this.baseUrl}/workflows/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs,
                    response_mode: 'blocking',
                    user: userIdentifier,
                    conversation_id: conversationId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Dify API Error Response:', errorData);
                throw new Error(`Dify API Error: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Dify Workflow Call Failed:', error.message);
            // Fallback to mock on network error if preferred, or just rethrow
            throw error;
        }
    }

    getMockResponse(inputs) {
        // Simple mock logic for missing flows
        let mockText = "Dify Flow not found. (Mock response)";
        let extraOutputs = {};

        if (inputs.topic && !inputs.name) {
            // Separation Flow Mock
            mockText = `Temel İlk Yardım Eğitimi genellikle aşağıdaki 5 ana başlık altında toplanır: <topics>İlk Yardımın Temel İlkeleri, Temel Yaşam Desteği (TYD), Yaralanmalarda İlk Yardım, Acil Durumlar ve Hastalıklarda İlk Yardım, Çevresel ve Özel Durumlarda İlk Yardım</topics>`;
        } else if (inputs.topic && inputs.name) {
            // Topic Flow Mock
            mockText = `Merhaba ${inputs.name}! ${inputs.topic} eğitimi için çok heyecanlıyım. Bugün seninle bu konuyu derinlemesine inceleyeceğiz.`;
        } else if (inputs.question && inputs.answer) {
            // Answer Score Flow Mock
            const score = Math.floor(Math.random() * 6) + 4; // Mock score 4-10
            mockText = `Cevabını değerlendirdim. Puanın: ${score}`;
            extraOutputs = { score };
        }

        return {
            data: {
                outputs: {
                    text: mockText,
                    ...extraOutputs
                }
            }
        }
    }
}

module.exports = new DifyService();
