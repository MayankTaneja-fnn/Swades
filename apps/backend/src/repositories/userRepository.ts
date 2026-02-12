import { getPrisma } from '../lib/db.js';

/**
 * Repository layer for user database operations
 */
export class UserRepository {
    async getUserById(databaseUrl: string, id: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(databaseUrl: string, email: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async createUser(databaseUrl: string, email: string, name?: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.user.create({
            data: { email, name },
        });
    }

    async findOrCreateUser(databaseUrl: string, email: string, name?: string) {
        const existingUser = await this.getUserByEmail(databaseUrl, email);

        if (existingUser) {
            return existingUser;
        }

        return this.createUser(databaseUrl, email, name);
    }

    async updateUser(databaseUrl: string, id: string, data: { email?: string; name?: string }) {
        const prisma = getPrisma(databaseUrl);
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(databaseUrl: string, id: string) {
        const prisma = getPrisma(databaseUrl);
        return prisma.user.delete({
            where: { id },
        });
    }
}

export const userRepo = new UserRepository();
