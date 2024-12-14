import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { tableController } from './controllers/tableController';

const app = new Elysia()
  .use(swagger())
  .use(tableController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;