import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    const USER_ID_ALICE = 'user-123-mock'
    const USER_ID_BOB = 'user-456-mock'

    // Fixed UUIDs for easy testing
    const ORDER_PENDING_ID = '550e8400-e29b-41d4-a716-446655440001'
    const ORDER_SHIPPED_ID = '550e8400-e29b-41d4-a716-446655440002'
    const ORDER_DELIVERED_ID = '550e8400-e29b-41d4-a716-446655440003'

    const INVOICE_PAID_ID_1 = '550e8400-e29b-41d4-a716-446655440004'
    const INVOICE_PAID_ID_2 = '550e8400-e29b-41d4-a716-446655440005'
    const INVOICE_PAID_ID_3 = '550e8400-e29b-41d4-a716-446655440006'

    // Cleanup existing mock data
    console.log('Cleaning up old data...')
    await prisma.message.deleteMany({ where: { conversation: { userId: { in: [USER_ID_ALICE, USER_ID_BOB] } } } })
    await prisma.conversation.deleteMany({ where: { userId: { in: [USER_ID_ALICE, USER_ID_BOB] } } })
    await prisma.invoice.deleteMany({ where: { userId: { in: [USER_ID_ALICE, USER_ID_BOB] } } })
    await prisma.order.deleteMany({ where: { userId: { in: [USER_ID_ALICE, USER_ID_BOB] } } })

    // Create Alice
    console.log('Creating users...')
    const alice = await prisma.user.upsert({
        where: { id: USER_ID_ALICE },
        update: {},
        create: {
            id: USER_ID_ALICE,
            email: 'alice@example.com',
            name: 'Alice User',
        },
    })

    // Create Bob
    const bob = await prisma.user.upsert({
        where: { id: USER_ID_BOB },
        update: {},
        create: {
            id: USER_ID_BOB,
            email: 'bob@example.com',
            name: 'Bob User',
        },
    })

    console.log('Creating orders with FIXED UUIDs...')

    // 1. Pending Order
    await prisma.order.create({
        data: {
            id: ORDER_PENDING_ID,
            userId: alice.id,
            status: 'PENDING',
            items: JSON.stringify([
                { name: 'Ergonomic Office Chair', price: 250.00, quantity: 1 }
            ]),
            totalAmount: 250.00,
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        }
    })

    // 2. Shipped Order
    await prisma.order.create({
        data: {
            id: ORDER_SHIPPED_ID,
            userId: alice.id,
            status: 'SHIPPED',
            items: JSON.stringify([
                { name: 'Wireless Headphones', price: 199.99, quantity: 1 },
                { name: 'USB-C Cable', price: 15.00, quantity: 2 }
            ]),
            totalAmount: 229.99,
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
        }
    })

    // 3. Delivered Order
    await prisma.order.create({
        data: {
            id: ORDER_DELIVERED_ID,
            userId: alice.id,
            status: 'DELIVERED',
            items: JSON.stringify([
                { name: 'Mechanical Keyboard', price: 150.00, quantity: 1 }
            ]),
            totalAmount: 150.00,
            deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // -5 days
        }
    })

    console.log('Creating invoices with FIXED UUIDs...')
    // Invoices
    await prisma.invoice.create({
        data: {
            id: INVOICE_PAID_ID_1,
            userId: alice.id,
            orderId: ORDER_PENDING_ID,
            amount: 250.00,
            status: 'PAID',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
    })

    await prisma.invoice.create({
        data: {
            id: INVOICE_PAID_ID_2,
            userId: alice.id,
            orderId: ORDER_SHIPPED_ID,
            amount: 229.99,
            status: 'PAID',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
    })

    await prisma.invoice.create({
        data: {
            id: INVOICE_PAID_ID_3,
            userId: alice.id,
            orderId: ORDER_DELIVERED_ID,
            amount: 150.00,
            status: 'PAID',
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }
    })

    console.log('Creating conversation history...')
    // Conversation History
    const conversation = await prisma.conversation.create({
        data: {
            userId: alice.id,
            summary: JSON.stringify({
                lastOrderId: ORDER_SHIPPED_ID,
                lastIssueType: 'ORDER',
                lastIntent: 'ORDER',
                lastConfidence: 0.95
            })
        }
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: 'user',
                content: 'Where is my headphone order?',
                intent: 'ORDER'
            },
            {
                conversationId: conversation.id,
                role: 'assistant',
                content: `I've checked your order for the Wireless Headphones. It is currently SHIPPED.`,
                intent: 'ORDER'
            }
        ]
    })

    console.log(`\nSeeding finished successfully.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
