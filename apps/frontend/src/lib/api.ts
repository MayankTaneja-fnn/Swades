import { hc } from 'hono/client';
// Import type from backend (relative path for monorepo direct access or via shared package if we exported it)
// Best practice: export AppType from backend index.ts and import here.
// But backend isn't a package we can import easily without build config.
// Alternative: We can move AppType to shared-types if possible, or just use 'any' temporarily for scaffolding 
// and then fix type import when backend is built/referenced.
// 
// Actually, Hono RPC requires the type of the `app` instance.
// In a monorepo, we can import it using relative path if we configure tsconfig paths,
// or we can use a shared package if we extract the route types.
// 
// For this assessment, let's try direct import assuming backend is built or accessible.
// If that fails, we might need to copy the type or accept 'any' for now.

// Let's assume we can import provided we set up references.
// But simpler approach: define a generic client or use 'AppType' if we can export it from a shared place.
// 
// Let's look at `apps/backend/src/index.ts`. We exported `AppType`.
// We can try importing it relative: `../../backend/src/index`.
// But that requires backend to be compiled or frontend to include backend source.
// 
// Plan: Usage of `hc<any>` for now to unblock, and add TODO to fix strict typing.

export const client = hc<any>('http://localhost:3000');
