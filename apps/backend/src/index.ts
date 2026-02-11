import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import chatRouter from './routes/chat.js';
import agentsRouter from './routes/agents.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = new Hono()
export { app }



app.use('/*', cors())


const REQUEST_LIMIT = process.env.NODE_ENV === 'development' ? 500 : 200;
app.use('/api/*', rateLimit({ windowMs: 15 * 60 * 1000, max: REQUEST_LIMIT }))

app.use('*', errorMiddleware)


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/chat', chatRouter);
app.route('/api/agents', agentsRouter);

const port = 3000


serve({
  fetch: app.fetch,
  port
})

export type AppType = typeof app
