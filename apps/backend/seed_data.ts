
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with dummy data...');

    const userId = 'user-1'; // Using a consistent user ID for testing

    // 1. Create User if not exists (optional, depending on schema strictness, but good practice)
    // detailed schema showed User model, so let's try to upsert it to be safe
    try {
        await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                id: userId,
                email: 'test@example.com',
                name: 'Test User'
            }
        });
        console.log('User ensure created/exists.');
    } catch (e) {
        console.log('Skipping user creation (might not be strictly required or already exists with different constraints): ' + e);
    }

    // 2. Create Orders
    const order1 = await prisma.order.create({
        data: {
            userId: userId,
            status: 'SHIPPED',
            items: JSON.stringify([
                { name: 'Wireless Headphones', price: 150.00, quantity: 1 },
                { name: 'USB-C Cable', price: 15.00, quantity: 2 }
            ]),
            totalAmount: 180.00,
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
        }
    });

    const order2 = await prisma.order.create({
        data: {
            userId: userId,
            status: 'PENDING',
            items: JSON.stringify([
                { name: 'Gaming Mouse', price: 60.00, quantity: 1 }
            ]),
            totalAmount: 60.00
        }
    });

    const order3 = await prisma.order.create({
        data: {
            userId: userId,
            status: 'DELIVERED',
            items: JSON.stringify([
                { name: 'Mechanical Keyboard', price: 120.00, quantity: 1 }
            ]),
            totalAmount: 120.00,
            deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
    });

    console.log('Created Orders:');
    console.log(`- Order ${order1.id} ($${order1.totalAmount}) [${order1.status}]`);
    console.log(`- Order ${order2.id} ($${order2.totalAmount}) [${order2.status}]`);
    console.log(`- Order ${order3.id} ($${order3.totalAmount}) [${order3.status}]`);

    // 3. Create Invoices
    const invoice1 = await prisma.invoice.create({
        data: {
            userId: userId,
            orderId: order1.id,
            amount: 180.00,
            status: 'PAID',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    const invoice2 = await prisma.invoice.create({
        data: {
            userId: userId,
            orderId: order2.id,
            amount: 60.00,
            status: 'PENDING',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    console.log('Created Invoices:');
    console.log(`- Invoice ${invoice1.id} for Order ${invoice1.orderId} [${invoice1.status}]`);
    console.log(`- Invoice ${invoice2.id} for Order ${invoice2.orderId} [${invoice2.status}]`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
