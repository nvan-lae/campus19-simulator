export class Verify2faDto {
  method: 'totp';
  userId: number;
  token: string;
}
