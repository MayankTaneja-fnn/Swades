import { hc } from 'hono/client';


export const client = hc<any>('http://localhost:3000');
