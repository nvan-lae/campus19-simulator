import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): any;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAvatar(req: any): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        id: number;
        email: string;
        username: string;
        intraId: string | null;
        avatarUrl: string | null;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | {}>;
}
