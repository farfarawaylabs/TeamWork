import { Hono } from 'hono';
import { cors } from 'hono/cors';
import initializeEnvironment from './middlewares/initializeEnvironment';
import teams from './api/teams';

const app = new Hono();

app.use('*', cors(), initializeEnvironment());

app.route('/teams', teams);

export default app;
