# TeamWork Project

The TeamWork project is designed to facilitate collaborative tasks among different AI models using feedback loops.
For example, instead of just asking ChatGPT to write a blog post, you can get a team of ChatGPT, Gemini and Anthropic to write it all together.

# The Feedback loop

When sending a task to a team, the team will work in the following manner:

1. The team leader will write his initial answer to the task.
2. It will then send it for feedback to all team members
3. Each team member will send back suggestions for improvements, why they thik they will help as well as their revised full asnwer.
4. This feedback is sent back to the team leader.
5. The team leader then decides which of the proposed changes to incorporate. He rewrites his answer using the changes he accepted and returns a rvised answer, as well as explnation of why he accepted or rejected some of the proposed changes.
6. This process will continue until a certain of requested max iterations is complete.

By using this feedback look, you can utilzie the capabilities of differnet models, to try and get to a final improved result.

## Getting Started

To get started with the Teamwork project, ensure you have Node.js installed on your system. Then, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and install dependencies:

```
npm install
```

3. Open wrangler.toml and fill in the API keys for the models you want to use.

4. Start the server

```sh
npm run dev
```

5. Send a POST request to localhost:8787/teams/run with the task and team you want to run.
   To see examples of the required body, open src/api/team.ts. I provided two routes for a copywriting and coding teams.

## Final Notes

### CloudFlare Workers

This project is written using CLoudFlare Workers but you can easily copy paste it to a regular node.js server.
All you need is to take all the code under the teams route and set your own environment variables.

### Langchain

This project is using langchain, mostly to be able to easily switch between different models.
I added support for OpenAI and Gemini, but you can easily add more models as you wish.
To add a model simply:

1. Open src/utils/ai.ts and add your model to getModelForTeamMember.
2. Add the required Environment variables.

You can also easily remove langchain and just replace it with direct calls to models SDKs.

## Contact

If you have any comments or need any help with anythihg, hit me up on LinkedIn: https://linkedin.com/in/nechmad
