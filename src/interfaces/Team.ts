import { TeamMember } from './TeamMember';

export enum TeamTypes {
	CopyWriters = 'copywriters',
	Coders = 'coders',
}
export interface Team {
	teamType: TeamTypes;
	teamLeader: TeamMember;
	members: TeamMember[];
}
