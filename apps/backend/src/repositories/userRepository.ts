import { prisma } from '../lib/db';

/**
 * Repository layer for user database operations
 */
export class UserRepository {
    async getUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async createUser(email: string, name?: string) {
        return prisma.user.create({
            data: { email, name },
        });
    }

    async findOrCreateUser(email: string, name?: string) {
        const existingUser = await this.getUserByEmail(email);

        if (existingUser) {
            return existingUser;
        }

        return this.createUser(email, name);
    }

    async updateUser(id: string, data: { email?: string; name?: string }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    }
}

export const userRepo = new UserRepository();
