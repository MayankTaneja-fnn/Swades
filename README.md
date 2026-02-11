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
│         │                          │                         │
│         ▼                          ▼                         │
│  ┌─────────────┐          ┌──────────────┐                 │
│  │ Repository  │          │ Agent Tools  │                 │
│  │    Layer    │          │              │                 │
│  └─────────────┘          └──────────────┘                 │
│         │                          │                         │
│         ▼                          ▼                         │
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
Agent Service → Chat/Conversation Repository
    ↓
Message saved to Database (Prisma)
```

### 2. Conversation Management Flow

```
New Chat Button → POST /api/chat/conversations
    ↓
Chat Controller → Conversation Repository
    ↓
Create Conversation in DB (Prisma)
    ↓
Return conversationId to Frontend
    ↓
Store in localStorage + state
```

### 3. Agent Routing Flow

```
User Message → Analyze content
    ↓
Agent Service → Conversation Repository (fetch context)
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
- PostgreSQL database (Neon Recommended)
- OpenAI API key or Groq API key



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
# Database (Neon)
DATABASE_URL="postgresql://neondb_owner:password@ep-host.aws.neon.tech/neondb?sslmode=require"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
GROQ_API_KEY="gsk_..."

# CORS (Optional, for production)
CORS_ORIGIN="https://your-frontend.vercel.app"
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

## 🌱 Seed Data for Testing

To populate your database with dummy data for testing, run:

```bash
cd apps/backend
npm run db:seed
```

This will create a test user (`Alice User`) and several order/invoice scenarios. Use the **exact UUIDs** below to test specific agent paths.

### 👤 Test User
- **Name:** Alice User
- **User ID:** `user-123-mock` (Auto-detected by mock auth)

### 📦 Order Scenarios

| Status | Order UUID | Description | Example Prompts |
| :--- | :--- | :--- | :--- |
| **PENDING** | `550e8400-e29b-41d4-a716-446655440001` | Created 7 days ago. Unfulfilled. | "Cancel order 550e...0001", "Change address for order 550e...0001" |
| **SHIPPED** | `550e8400-e29b-41d4-a716-446655440002` | On the way. Trackable. | "Track order 550e...0002", "Where is my order?" |
| **DELIVERED** | `550e8400-e29b-41d4-a716-446655440003` | Delivered 5 days ago. | "Return order 550e...0003", "I want a refund" |

### 💳 Invoice Scenarios

| Status | Invoice UUID | For Order | Example Prompts |
| :--- | :--- | :--- | :--- |
| **PAID** | `550e8400-e29b-41d4-a716-446655440004` | Pending Order | "Get invoice 550e...0004", "Show my paid invoices" |
| **PAID** | `550e8400-e29b-41d4-a716-446655440005` | Shipped Order | | 
| **PAID** | `550e8400-e29b-41d4-a716-446655440006` | Delivered Order | |

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
│   │   │   ├── repositories/
│   │   │   │   ├── chatRepository.ts
│   │   │   │   ├── conversationRepository.ts
│   │   │   │   └── userRepository.ts
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



