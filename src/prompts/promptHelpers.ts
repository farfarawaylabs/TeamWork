import buildCopyWritingTeamLeaderPrompt from '@/prompts/copywriting/teamLeaderInitialPrompt';
import buildCopyWritingTeamMemberPrompt from '@/prompts/copywriting/teamMemberPrompt';
import buildcopywritingTeamLeaderIterationPrompt from '@/prompts/copywriting/teamLeaderIterationPrompt';

import buildCodingTeamLeaderPrompt from '@/prompts/coding/teamLeaderInitialPrompt';
import buildCodingTeamMemberPrompt from '@/prompts/coding/teamMemberPrompt';
import buildCodingTeamLeaderIterationPrompt from '@/prompts/coding/teamLeaderIterationPrompt';

import { TeamTypes } from '@/interfaces/Team';

export function getTeamLeaderInitialPrompt(team: TeamTypes, task: string, numOfTeamMembers = 2, maxIterations = 4) {
	switch (team) {
		case TeamTypes.CopyWriters:
			return buildCopyWritingTeamLeaderPrompt(task, numOfTeamMembers, maxIterations);

		case TeamTypes.Coders:
			return buildCodingTeamLeaderPrompt(task, numOfTeamMembers, maxIterations);

		default:
			throw new Error(`Team type ${team} not supported`);
	}
}

export function getTeamMemberPrompt(team: TeamTypes, task: string, messageHistory: string) {
	switch (team) {
		case TeamTypes.CopyWriters:
			return buildCopyWritingTeamMemberPrompt(task, messageHistory);

		case TeamTypes.Coders:
			return buildCodingTeamMemberPrompt(task, messageHistory);

		default:
			throw new Error(`Team type ${team} not supported`);
	}
}

export function getTeamLeaderIterationPrompt(team: TeamTypes, task: string, messageHistory: string) {
	switch (team) {
		case TeamTypes.CopyWriters:
			return buildcopywritingTeamLeaderIterationPrompt(task, messageHistory);

		case TeamTypes.Coders:
			return buildCodingTeamLeaderIterationPrompt(task, messageHistory);

		default:
			throw new Error(`Team type ${team} not supported`);
	}
}
