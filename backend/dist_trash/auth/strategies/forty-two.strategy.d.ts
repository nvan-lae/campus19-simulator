import { AuthService } from '../auth.service';
declare const FortyTwoStrategy_base: new (...args: unknown[]) => any;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: any): Promise<{
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
export {};
