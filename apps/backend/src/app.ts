import { Hono } from "hono";
import { cors } from "hono/cors";
import chatRouter from "./routes/chat.js";
import agentsRouter from "./routes/agents.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", (c) => c.body(null, 204));

const REQUEST_LIMIT = process.env.NODE_ENV === "development" ? 500 : 200;

app.use("/api/*", async (c, next) => {
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  await next();
});

app.use("/api/*", rateLimit({ windowMs: 15 * 60 * 1000, max: REQUEST_LIMIT }));

app.use("*", errorMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/chat", chatRouter);
app.route("/api/agents", agentsRouter);

export { app };
export type AppType = typeof app;
