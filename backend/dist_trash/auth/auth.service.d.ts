import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    validate42User(profile: any): Promise<{
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
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(data: any): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            username: string;
            intraId: string | null;
            avatarUrl: string | null;
            isTwoFactorEnabled: boolean;
            twoFactorSecret: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
