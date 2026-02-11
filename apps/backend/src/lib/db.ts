import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Configure Neon to use 'ws' package for WebSockets in Node.js environment
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a pool and adapter
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ['query'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

