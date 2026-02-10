# AI Support System

A full-stack AI-powered customer support system with intelligent agent routing, real-time streaming responses, and conversation management.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [API Routes](#api-routes)
- [Installation](#installation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## 🎯 Overview

The AI Support System is a monorepo-based full-stack application that provides intelligent customer support through AI agents. The system features:

- **Multi-Agent Architecture**: Specialized agents for ORDER, BILLING, and SUPPORT queries
- **Real-time Streaming**: AI responses stream in real-time using Server-Sent Events
- **Conversation Management**: Persistent conversation history with message tracking
- **Type-Safe**: End-to-end type safety with TypeScript and shared types
- **Modern Stack**: Built with React, Hono, Prisma, and Vercel AI SDK

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI/Groq integration
- **Testing**: Vitest with native Hono testing utilities

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **AI Integration**: `@ai-sdk/react` for streaming chat
- **Testing**: Vitest + React Testing Library + happy-dom

### Shared
- **Monorepo**: npm workspaces with Turbo
- **Type Sharing**: `shared-types` package for cross-app type safety
- **Validation**: Zod schemas

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Chat UI     │  │ Conversation │  │ Message      │       │
│  │ Component   │──│ Management   │──│ Input        │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│         │                                                     │
│         │ HTTP/SSE                                           │
└─────────┼─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Hono)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Routes                          │   │
│  │  /api/chat/*        /api/agents/*                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                          │                         │
│         ▼                          ▼                         │
│  ┌─────────────┐          ┌──────────────┐                 │
│  │   Chat      │          │   Agent      │                 │
│  │ Controller  │          │ Controller   │                 │
│  └─────────────┘          └──────────────┘                 │
│         │                          │                         │
│         ▼                          ▼                         │
│  ┌─────────────┐          ┌──────────────┐                 │
│  │   Chat      │          │   Agent      │                 │
│  │  Service    │          │  Service     │                 │
│  └─────────────┘          └──────────────┘                 │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────┐               │
│  │          Prisma ORM                      │               │
│  └─────────────────────────────────────────┘               │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   User   │  │Conversation│ │ Message  │  │  Order   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                              ┌──────────┐   │
│                                              │ Invoice  │   │
│                                              └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Agent Architecture

The system uses specialized AI agents for different types of queries:

- **ORDER Agent**: Handles order tracking, cancellations, delivery updates
- **BILLING Agent**: Manages invoices, payments, refunds
- **SUPPORT Agent**: General customer support queries

Each agent has:
- Specific tools/capabilities
- Custom system prompts
- Dedicated routing logic

---

## 🔄 Data Flow

### 1. Message Sending Flow

```
User Input → Frontend Chat Component
    ↓
POST /api/chat/messages (with conversationId + messages)
    ↓
Chat Controller → Agent Service (route to appropriate agent)
    ↓
AI SDK streamText() → OpenAI/Groq API
    ↓
Server-Sent Events (SSE) Stream
    ↓
Frontend useChat hook → Real-time UI updates
    ↓
Message saved to Database (Prisma)
```

### 2. Conversation Management Flow

```
New Chat Button → POST /api/chat/conversations
    ↓
Create Conversation in DB
    ↓
Return conversationId to Frontend
    ↓
Store in localStorage + state
    ↓
All messages linked to this conversation
```

### 3. Agent Routing Flow

```
User Message → Analyze content
    ↓
Determine agent type (ORDER/BILLING/SUPPORT)
    ↓
Load agent capabilities + tools
    ↓
Execute with appropriate system prompt
    ↓
Stream response with tool execution
```

---

## 🛣 API Routes

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/conversations` | List all conversations | - | `Conversation[]` |
| POST | `/conversations` | Create new conversation | - | `{ id, userId }` |
| GET | `/conversations/:id` | Get conversation messages | - | `Message[]` |
| DELETE | `/conversations/:id` | Delete conversation | - | `{ success: true }` |
| POST | `/messages` | Send message (streaming) | `{ conversationId, messages }` | SSE Stream |
| POST | `/` | SDK fallback endpoint | `{ conversationId, messages }` | SSE Stream |

### Agent Routes (`/api/agents`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | List all agents | `AgentCapability[]` |
| GET | `/:type/capabilities` | Get agent capabilities | `{ type, tools, description }` |

---

## 🏥 Health Monitoring

### Backend Health Endpoint

The backend provides a health check endpoint for monitoring:

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Usage:**
```bash
curl http://localhost:3000/health
```

This endpoint can be used by:
- Load balancers for health checks
- Monitoring tools (e.g., Prometheus, Datadog)
- Docker health checks
- Kubernetes liveness/readiness probes

### Docker Health Checks

The PostgreSQL container includes automatic health checks:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**Check container health:**
```bash
docker-compose ps
# Look for "healthy" status
```

**View health check logs:**
```bash
docker inspect ai-support-postgres --format='{{json .State.Health}}' | jq
```

### Monitoring Best Practices

For production deployments, consider:
- Setting up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Implementing application performance monitoring (APM)
- Configuring database connection pool monitoring
- Setting up alerts for failed health checks
- Monitoring API response times and error rates

---

## 📦 Installation

### Prerequisites

- Node.js 20+ 
- PostgreSQL database (or Docker)
- OpenAI API key or Groq API key

### Option A: Using Docker (Recommended)

The easiest way to get started is using Docker for PostgreSQL.

**Step 1: Create `docker-compose.yml` in project root**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ai-support-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_support
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Step 2: Start PostgreSQL**

```bash
docker-compose up -d
```

**Step 3: Verify it's running**

```bash
docker-compose ps
```

Your `DATABASE_URL` in `.env` should be:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_support"
```

**Useful Docker Commands:**

```bash
# Stop database
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it ai-support-postgres psql -U postgres -d ai_support
```

### Option B: Local PostgreSQL Installation

If you prefer to install PostgreSQL locally, follow the [official installation guide](https://www.postgresql.org/download/).

---

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ai-support-system
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (backend, frontend, shared-types).

### Step 3: Environment Setup

Create `.env` file in `apps/backend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_support"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
GROQ_API_KEY="gsk_..."

# Server
PORT=3000
```

### Step 4: Database Setup

```bash
cd apps/backend

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with dummy data
npm run db:seed
```

### Step 5: Start Development Servers

From root directory:

```bash
npm run dev
```

This starts:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Or start individually:

```bash
# Backend only
cd apps/backend
npm run dev

# Frontend only
cd apps/frontend
npm run dev
```

---

## 🧪 Testing

### Run All Tests

```bash
# From root
npm test

# Or individually
cd apps/backend && npm test
cd apps/frontend && npm test
```

### Backend Tests (8 tests)

```bash
cd apps/backend
npm test
```

**Coverage:**
- ✅ GET /api/chat/conversations
- ✅ POST /api/chat/conversations
- ✅ GET /api/chat/conversations/:id
- ✅ DELETE /api/chat/conversations/:id
- ✅ POST /api/chat/messages (streaming)
- ✅ POST /api/chat/ (SDK fallback)
- ✅ GET /api/agents
- ✅ GET /api/agents/:type/capabilities

### Frontend Tests (2 tests)

```bash
cd apps/frontend
npm test
```

**Coverage:**
- ✅ App component renders
- ✅ Chat component renders

### Test Configuration

**Backend:**
- Framework: Vitest
- Strategy: Hono native `app.request()` testing
- Mocking: `@hono/node-server` mocked to prevent port conflicts

**Frontend:**
- Framework: Vitest
- Library: React Testing Library
- Environment: happy-dom
- Mocking: `@ai-sdk/react` and `fetch` globally mocked

---

## 📁 Project Structure

```
ai-support-system/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Database schema
│   │   │   └── seed.ts                # Seed script
│   │   ├── src/
│   │   │   ├── __tests__/             # Test files
│   │   │   │   ├── chat.test.ts
│   │   │   │   └── agents.test.ts
│   │   │   ├── config/
│   │   │   │   └── agentCapabilities.ts  # Agent definitions
│   │   │   ├── controllers/
│   │   │   │   ├── chatController.ts
│   │   │   │   └── agentController.ts
│   │   │   ├── routes/
│   │   │   │   ├── chat.ts
│   │   │   │   └── agents.ts
│   │   │   ├── services/
│   │   │   │   └── agentService.ts    # AI integration
│   │   │   └── index.ts               # Entry point
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── __tests__/             # Test files
│       │   │   ├── App.test.tsx
│       │   │   └── Chat.test.tsx
│       │   ├── components/
│       │   │   ├── Chat.tsx           # Main chat component
│       │   │   ├── MessageList.tsx
│       │   │   └── MessageInput.tsx
│       │   ├── test/
│       │   │   └── setup.ts           # Test setup
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── vitest.config.ts
│       └── package.json
│
├── packages/
│   └── shared-types/
│       ├── src/
│       │   └── index.ts               # Shared TypeScript types
│       └── package.json
│
├── package.json                       # Root package.json
└── turbo.json                         # Turbo config
```

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `OPENAI_API_KEY` | Yes* | OpenAI API key | `sk-...` |
| `GROQ_API_KEY` | Yes* | Groq API key (alternative) | `gsk_...` |
| `PORT` | No | Server port (default: 3000) | `3000` |

*Either `OPENAI_API_KEY` or `GROQ_API_KEY` is required

### Frontend (`apps/frontend/.env`)

No environment variables required. API URL is configured in `vite.config.ts` proxy.

---

## 🚀 Deployment

### Backend Deployment

1. Build the backend:
```bash
cd apps/backend
npm run build
```

2. Set environment variables on your hosting platform

3. Run migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm start
```

### Frontend Deployment

1. Update API URL in `vite.config.ts` if needed

2. Build the frontend:
```bash
cd apps/frontend
npm run build
```

3. Deploy the `dist/` folder to your static hosting service

---

## 📊 Database Schema

### User
- `id`: String (Primary Key)
- `email`: String (Unique)
- `name`: String

### Conversation
- `id`: String (Primary Key)
- `userId`: String (Foreign Key → User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Message
- `id`: String (Primary Key)
- `conversationId`: String (Foreign Key → Conversation)
- `role`: Enum (user, assistant, system)
- `content`: String
- `createdAt`: DateTime

### Order
- `id`: String (Primary Key)
- `userId`: String (Foreign Key → User)
- `status`: Enum (PENDING, SHIPPED, DELIVERED, CANCELLED)
- `items`: JSON
- `totalAmount`: Float
- `deliveryDate`: DateTime

### Invoice
- `id`: String (Primary Key)
- `userId`: String (Foreign Key → User)
- `orderId`: String (Foreign Key → Order)
- `amount`: Float
- `status`: Enum (PENDING, PAID, OVERDUE)
- `dueDate`: DateTime

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

ISC

---

## 🆘 Support

For issues and questions, please open an issue on GitHub.