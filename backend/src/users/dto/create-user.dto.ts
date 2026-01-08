export class CreateUserDto {
  email: string;
  username: string;
  password?: string;
  intraId?: string;
  avatarUrl?: string;
}
