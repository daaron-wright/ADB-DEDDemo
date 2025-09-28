import { RequestHandler } from 'express';
import { z } from 'zod';

const generateRequestSchema = z.object({
  message: z.string(),
});

export const handleGenerate: RequestHandler = async (req, res) => {
  try {
    const { message } = generateRequestSchema.parse(req.body);

    // In a real application, you would call a generative AI API here.
    // For this example, we'll simulate a response.
    const aiResponse = `This is a unique response to: "${message}"`;

    res.json({ response: aiResponse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};
