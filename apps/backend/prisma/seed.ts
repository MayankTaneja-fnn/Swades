import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create the mock user with the ID used in controllers
    const user = await prisma.user.upsert({
        where: { id: 'user-123-mock' },
        update: {},
        create: {
            id: 'user-123-mock',
            email: 'alice@example.com',
            name: 'Alice User',
        },
    })

    // Create mock orders
    const order1 = await prisma.order.create({
        data: {
            userId: user.id,
            status: 'SHIPPED',
            items: JSON.stringify([{ name: 'Wireless Headphones', price: 199.99 }]),
            totalAmount: 199.99,
            deliveryDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
        },
    })

    const order2 = await prisma.order.create({
        data: {
            userId: user.id,
            status: 'DELIVERED',
            items: JSON.stringify([{ name: 'Mechanical Keyboard', price: 150.00 }]),
            totalAmount: 150.00,
            deliveryDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
        },
    })

    // Create mock invoices
    await prisma.invoice.create({
        data: {
            userId: user.id,
            orderId: order1.id,
            amount: 199.99,
            status: 'PAID',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
    })

    await prisma.invoice.create({
        data: {
            userId: user.id,
            orderId: order2.id,
            amount: 150.00,
            status: 'PAID',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        },
    })

    // Create mock conversation and messages
    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
        },
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: 'user',
                content: 'Hello, I need help with my recent order.',
            },
            {
                conversationId: conversation.id,
                role: 'assistant',
                content: 'Hello Alice! I can certainly help you with that. Which order are you referring to?',
            },
            {
                conversationId: conversation.id,
                role: 'user',
                content: 'The one with the Wireless Headphones.',
            },
        ],
    })

    console.log('Seed data created.')
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
