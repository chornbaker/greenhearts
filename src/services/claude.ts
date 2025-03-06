import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client only in browser environment
const anthropic = typeof window !== 'undefined' 
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
  : null;

/**
 * Send a message to Claude and get a response
 * @param prompt The user's message to Claude
 * @returns The response from Claude
 */
export async function sendMessageToClaude(prompt: string): Promise<string> {
  try {
    if (!anthropic) {
      throw new Error('Anthropic client is not initialized');
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if the content block is of type 'text'
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    return 'No text response received';
  } catch (error) {
    console.error('Error communicating with Claude:', error);
    throw error;
  }
}

export { anthropic }; 