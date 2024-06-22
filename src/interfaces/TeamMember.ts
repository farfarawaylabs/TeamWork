export type TeamMemberAIModel = 'OPENAI' | 'GEMINI' | 'ANTHROPIC';

export interface TeamMember {
	type: TeamMemberAIModel;
}
