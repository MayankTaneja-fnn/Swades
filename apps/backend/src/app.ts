import { Hono } from "hono";
import { cors } from "hono/cors";
import chatRouter from "./routes/chat.js";
import agentsRouter from "./routes/agents.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

export type Env = {
  DATABASE_URL: string;
  GROQ_API_KEY: string;
};

export const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", (c) => c.body(null, 204));

// no process.env on Cloudflare
const REQUEST_LIMIT = 200;

app.use("/api/*", async (c, next) => {
  if (c.req.method === "OPTIONS") return c.body(null, 204);
  await next();
});

app.use("/api/*", rateLimit({ windowMs: 15 * 60 * 1000, max: REQUEST_LIMIT }));

app.use("*", errorMiddleware);

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Debug route to confirm env is loaded
app.get("/api/debug/env", (c) => {
  return c.json({
    hasDatabaseUrl: !!c.env.DATABASE_URL,
    hasGroqKey: !!c.env.GROQ_API_KEY,
  });
});

app.route("/api/chat", chatRouter);
app.route("/api/agents", agentsRouter);

export type AppType = typeof app;
