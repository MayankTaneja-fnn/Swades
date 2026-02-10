
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany();
    const invoices = await prisma.invoice.findMany();
    const outputPath = path.join(__dirname, 'data_output.txt');

    let output = '--- ORDERS ---\n';
    orders.forEach(o => {
        output += `ID: ${o.id} | Status: ${o.status} | Amount: $${o.totalAmount}\n`;
    });

    output += '\n--- INVOICES ---\n';
    invoices.forEach(i => {
        output += `ID: ${i.id} | OrderID: ${i.orderId} | Status: ${i.status} | Amount: $${i.amount}\n`;
    });

    fs.writeFileSync(outputPath, output);
    console.log('Data written to ' + outputPath);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
