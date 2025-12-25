const path = require('path');
const fs = require('fs');

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
  async callWorkflow(apiKey, inputs, userIdentifier, conversationId = null, flowName = null) {
    if (!apiKey) {
      console.log(
        `Skipping Dify call for [${flowName}]: No API Key provided. Returning mock data.`
      );
      return this.getMockResponse(flowName, inputs);
    }

    try {
      const response = await fetch(`${this.baseUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs,
          response_mode: 'blocking',
          user: userIdentifier,
          ...(conversationId && { conversation_id: conversationId }),
        }),
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
      throw error;
    }
  }

  getMockResponse(flowName, inputs) {
    const mockFilePath = path.join(__dirname, `../mocks/${flowName}.json`);

    try {
      if (fs.existsSync(mockFilePath)) {
        const rawData = fs.readFileSync(mockFilePath, 'utf8');
        let data = JSON.parse(rawData);

        // Dynamic replacements in mock text
        if (data.data && data.data.outputs && data.data.outputs.text) {
          let text = data.data.outputs.text;

          if (inputs.topic) text = text.replace('<topic>', inputs.topic);
          if (inputs.name) text = text.replace('<name>', inputs.name);

          data.data.outputs.text = text;
        }

        return data;
      }
    } catch (error) {
      console.error(`Failed to load mock for [${flowName}]:`, error.message);
    }

    // Default fallback if file is missing or error occurs
    return {
      data: {
        outputs: {
          text: `Dify Flow [${flowName}] not found. (System fallback mock)`,
        },
      },
    };
  }
}

module.exports = new DifyService();
