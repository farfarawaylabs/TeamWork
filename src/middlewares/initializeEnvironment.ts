import { createMiddleware } from 'hono/factory';
import Environment from '@/utils/Environment';

/**
 * Initializes the environment by setting the necessary API keys.
 * @returns A middleware function that sets the API keys and calls the next middleware.
 */
const initializeEnvironment = () => {
	return createMiddleware(async (c, next) => {
		Environment.openAiApiKey = c.env.OPENAI_API_KEY;
		Environment.geminiApiKey = c.env.GEMINI_API_KEY;
		Environment.anthropicApiKey = c.env.ANTHROPIC_API_KEY;
		Environment.langsmithApiKey = c.env.LANGSMITH_API_KEY;

		await next();
	});
};

export default initializeEnvironment;
