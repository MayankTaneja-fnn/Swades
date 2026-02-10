import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import chatRouter from './routes/chat';
import agentsRouter from './routes/agents';
import { rateLimit } from './middleware/rateLimit';
import { errorMiddleware } from './middleware/errorMiddleware';

const app = new Hono()
export { app }


// Global middleware
app.use('/*', cors())
app.use('/api/*', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })) // 100 requests per 15 minutes
app.use('*', errorMiddleware) // Global error handling

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/chat', chatRouter);
app.route('/api/agents', agentsRouter);

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export type AppType = typeof app
