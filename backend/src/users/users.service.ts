import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Find a user by their unique 42 ID (for OAuth)
  async findByIntraId(intraId: string) {
    return this.prisma.user.findUnique({ where: { intraId } });
  }

  // Find a user by email (for standard login)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Find a user by ID (used by JWT strategy to verify session)
  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Create a new user
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}