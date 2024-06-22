import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { Team, TeamTypes } from '@/interfaces/Team';
import { getAiCallbacks, getModelForTeamMember } from '@/utils/ai';
import { TeamMember } from '@/interfaces/TeamMember';
import { PromptTemplate } from '@langchain/core/prompts';
import { getTeamLeaderInitialPrompt, getTeamLeaderIterationPrompt, getTeamMemberPrompt } from '@/prompts/promptHelpers';
import { RunnableSequence } from '@langchain/core/runnables';

/**
 * Send an initial team task to the team leader and get the result.
 *
 * @param task - The task to be performed.
 * @param team - The team for which the task is being performed.
 * @param maxNumOfIterations - The maximum number of iterations for the task. Default is 4.
 * @returns A promise that resolves to the result of the task.
 */
async function runInitalTask(task: string, team: Team, maxNumOfIterations = 4) {
	const teamLeaderAiModel = getModelForTeamMember(team.teamLeader.type);

	const initialPrompt = getTeamLeaderInitialPrompt(team.teamType, task, team.members.length + 1, maxNumOfIterations);

	const chain = PromptTemplate.fromTemplate(initialPrompt, { validateTemplate: false, templateFormat: 'mustache' })
		.pipe(teamLeaderAiModel)
		.pipe(new StringOutputParser());

	const result = await chain.invoke({}, { callbacks: getAiCallbacks() });

	return result;
}

/**
 * Retrieves feedback from a team member for a given task and iterations history.
 *
 * @param teamType - The type of team for which feedback is requested.
 * @param member - The team member from whom to get feedback.
 * @param task - The task for which feedback is requested.
 * @param iterationsHistory - The history of iterations for the task.
 * @returns A Promise that resolves to the feedback response from the team member.
 */
async function getFeedbackFromMember(teamType: TeamTypes, member: TeamMember, task: string, iterationsHistory: string) {
	const memberAiModel = getModelForTeamMember(member.type);

	const memberPrompt = getTeamMemberPrompt(teamType, task, iterationsHistory);

	console.log(memberPrompt);

	const chain = PromptTemplate.fromTemplate(memberPrompt, { validateTemplate: false, templateFormat: 'mustache' })
		.pipe(memberAiModel)
		.pipe(new StringOutputParser());

	const response = await chain.invoke({}, { callbacks: getAiCallbacks() });

	return response;
}

/**
 * Sends a task for feedback to all members of a team.
 *
 * @param task - The task to send for feedback.
 * @param messagesHistory - The history of messages related to the task.
 * @param team - The team object containing the members.
 * @returns A promise that resolves to an array of feedbacks from all team members.
 */
async function sendForFeedback(task: string, messagesHistory: string, team: Team) {
	const feedbackPromises = team.members.map((member) => getFeedbackFromMember(team.teamType, member, task, messagesHistory));

	const feedbacks = await Promise.all(feedbackPromises);

	return feedbacks;
}

/**
 * Formats the feedback provided by team members.
 *
 * @param feedback - An array of strings representing the feedback from team members.
 * @returns A formatted string containing the feedback from each team member.
 */
function formatFeedback(feedback: string[]) {
	return feedback
		.map((feedback, index) => {
			return `Feedback from team member ${index + 1}: ${feedback}`;
		})
		.join('\n');
}

/**
 * Sends feedback to the team leader and receives his response.
 *
 * @param teamType - The type of team for which feedback is being provided.
 * @param teamLeader - The team leader to send feedback to.
 * @param task - The task for which feedback is being provided.
 * @param messageHistory - The history of messages related to the task.
 * @returns An object containing the team leader's answer, explanation, and decision for further iterations.
 */
async function sendFeedbackToTeamLeader(teamType: TeamTypes, teamLeader: TeamMember, task: string, messageHistory: string) {
	// Define the schema for the expected response from the team leader
	const zodSchema = z.object({
		answer: z.string().describe('Your new answer to the task'),
		explanation: z.string().describe('Your explanation for why you chose to accept some feedback and reject other'),
		shouldIterateMore: z.boolean().describe('Your decision should you run another feedback iteration'),
	});

	// Build the prompt for the team leader
	const teamLeaderPrompt = getTeamLeaderIterationPrompt(teamType, task, messageHistory);

	// Get the AI model for the team leader
	const teamLeaderAiModel = getModelForTeamMember(teamLeader.type);

	// Create a structured model with the defined schema
	const structuredModel = teamLeaderAiModel.withStructuredOutput(zodSchema, { name: 'teamLeader' });

	// Create a chain of prompts and models
	const chain = PromptTemplate.fromTemplate(teamLeaderPrompt, { validateTemplate: false, templateFormat: 'mustache' }).pipe(
		structuredModel
	);

	// Invoke the chain and await the response
	const result = (await chain.invoke({}, { callbacks: getAiCallbacks() })) as {
		answer: string;
		explanation: string;
		shouldIterateMore: boolean;
	};

	return result;
}

/**
 * Runs a team task with iterative feedback.
 *
 * @param task - The task to be performed by the team.
 * @param team - The team object containing the team leader and members.
 * @param maxNumOfIterations - The maximum number of iterations for feedback (default: 4).
 * @returns An object containing the final result and the message history.
 * @throws Error if the team leader is not provided or if there are no team members.
 */
export async function runTeam(task: string, team: Team, maxNumOfIterations = 4) {
	console.log('Running team task', team);
	if (!team.teamLeader) {
		throw new Error('Team leader is required to run a team.');
	}

	if (!team.members || team.members.length === 0) {
		throw new Error('At least one team member is required to run a team.');
	}

	console.log('Running initial task');
	// Run the initial task and get back its result
	const initialDraft = await runInitalTask(task, team, maxNumOfIterations);

	console.log('initial taks done');

	// While we still want feedback, ask each team member for feedback.
	const revisions = [initialDraft];
	let iteration = 1;
	let shouldRunAnotherIteration = true;
	let iterationsHistory = `The task: ${task}.
	Initial answer to task:
	${initialDraft}

	`;

	let finalAnswer = '';
	while (iteration <= maxNumOfIterations && shouldRunAnotherIteration) {
		console.log('calling for feedback for iteration', iteration);
		const membersFeedback = await sendForFeedback(task, iterationsHistory, team);

		console.log('feedback received');

		const formattedFeddback = formatFeedback(membersFeedback);

		iterationsHistory = `${iterationsHistory}.
		Iteration ${iteration} feedback: ${formattedFeddback}`;

		console.log('sending feedback to team leader');

		// Send the feedback back to the team leader for review.
		const { answer, explanation, shouldIterateMore } = await sendFeedbackToTeamLeader(
			team.teamType,
			team.teamLeader,
			task,
			iterationsHistory
		);

		console.log('feedback received from team leader');

		revisions.push(answer);
		iterationsHistory = `${iterationsHistory}.

		New draft from the team leader: ${answer}. Explanation from team leader: ${explanation}.

		`;

		finalAnswer = answer;

		// The Ai seems to decide mosto of the time that that one iteration was enough so we now ignore his opinipon and go for the full max iteration number. Uncomment the next line if you want to use it.
		//shouldRunAnotherIteration = shouldIterateMore;

		iteration++;
	}

	return { finalAnswer, revisions, fullTeamDiscussion: iterationsHistory };
}
