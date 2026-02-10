
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const order = await prisma.order.findFirst();
    if (order) {
        console.log(`ORDER_ID: ${order.id}`);
    } else {
        console.log('No orders found.');
        // Create one for testing if none exist
        const newOrder = await prisma.order.create({
            data: {
                userId: 'test-user',
                status: 'PENDING',
                items: JSON.stringify([{ name: 'Test Item', price: 100 }]),
                totalAmount: 100,
            }
        });
        console.log(`CREATED_ORDER_ID: ${newOrder.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
