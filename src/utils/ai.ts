import { TeamMemberAIModel } from '@/interfaces/TeamMember';
import Environment from './Environment';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LangChainTracer } from 'langchain/callbacks';
import { Client } from 'langsmith/client';
import { ChatAnthropic } from '@langchain/anthropic';

/**
 * Returns the AI model based on the requested model type.
 * @param requestedModel - The requested model type.
 * @returns The AI model instance.
 * @throws Error if the requested model type is unknown or if the required API key is not provided.
 */
export function getModelForTeamMember(requesedModel: TeamMemberAIModel) {
	switch (requesedModel) {
		case 'OPENAI':
			const openAiApiKey = Environment.openAiApiKey;

			if (!openAiApiKey) {
				throw new Error('OpenAI API key is not provided');
			}
			return new ChatOpenAI({ model: 'gpt-4o', apiKey: openAiApiKey });

		case 'GEMINI':
			const geminiApiKey = Environment.geminiApiKey;
			if (!geminiApiKey) {
				throw new Error('Gemini API key is not provided');
			}
			return new ChatGoogleGenerativeAI({
				apiKey: geminiApiKey,
				model: 'gemini-pro',
			});

		case 'ANTHROPIC':
			const anthropicApiKey = Environment.anthropicApiKey;

			if (!anthropicApiKey) {
				throw new Error('Anthropic API key is not provided');
			}

			return new ChatAnthropic({ apiKey: anthropicApiKey, model: 'claude-3-5-sonnet-20240620' });

		default:
			throw new Error('Unknown model');
	}
}

/**
 * Retrieves the AI callbacks based on the environment configuration.
 * If the Langsmith API key is available, it creates a new instance of LangChainTracer
 * with a Client initialized using the API key.
 * Otherwise, it returns an empty array.
 * @returns An array of AI callbacks.
 */
export function getAiCallbacks() {
	const callbacks = Environment.langsmithApiKey
		? [new LangChainTracer({ client: new Client({ apiKey: Environment.langsmithApiKey }) })]
		: [];

	return callbacks;
}
