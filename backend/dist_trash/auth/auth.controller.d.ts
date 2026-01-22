import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: any): Promise<{
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
    login(req: any): Promise<{
        access_token: string;
    }>;
    login42(): Promise<void>;
    callback(req: any, res: any): Promise<void>;
}
