import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByIntraId(intraId: string): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        password: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        password: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        password: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(data: Prisma.UserCreateInput): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        password: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, data: Prisma.UserUpdateInput): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        password: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
