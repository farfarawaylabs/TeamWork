import { runTeam } from '@/bl/teams/runTeam';
import { Team, TeamTypes } from '@/interfaces/Team';
import { Hono } from 'hono';
import { PromptTemplate } from '@langchain/core/prompts';

interface GeneralTeamJob {
	task: string;
	team: Team;
	maxIterations: number;
}

const app = new Hono();

app.post('/run', async (c) => {
	const body: GeneralTeamJob = await c.req.json();

	const response = await runTeam(body.task, body.team, body.maxIterations);

	return c.json({ poem: response });
});

app.post('/copywriters', async (c) => {
	const body: { task: string } = await c.req.json();

	const response = await runTeam(
		body.task,
		{
			teamType: TeamTypes.CopyWriters,
			teamLeader: {
				type: 'OPENAI',
			},
			members: [
				{
					type: 'GEMINI',
				},
			],
		},
		2
	);

	return c.json(response);
});

app.post('/coders', async (c) => {
	const body: { task: string } = await c.req.json();

	const response = await runTeam(
		body.task,
		{
			teamType: TeamTypes.Coders,
			teamLeader: {
				type: 'OPENAI',
			},
			members: [
				{
					type: 'GEMINI',
				},
				{
					type: 'OPENAI',
				},
			],
		},
		2
	);

	return c.json(response);
});

export default app;
