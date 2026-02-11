import { hc } from 'hono/client';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const client = hc<any>(API_URL);
