import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

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

  // Update a user
  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getStats(userId: number) {
    const totalMatches = await this.prisma.matchPlayer.count({
      where: { userId },
    });

    const wins = await this.prisma.matchPlayer.count({
      where: { userId, isWinner: true },
    });

    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    const stats = {
      totalMatches,
      wins,
      losses,
      winRate: Math.round(winRate * 100) / 100, // Round to 2 decimals
    };

    console.log(`[UsersService] getStats for ${userId}:`, stats);
    return stats;
  }

  async getMatches(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const matches = await this.prisma.matchPlayer.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            players: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        match: {
          endedAt: 'desc',
        },
      },
      skip,
      take: limit,
    });

    console.log(`[UsersService] getMatches for ${userId} found ${matches.length} matches`);

    // Transform to a cleaner structure if needed, or return as is
    return matches.map((mp) => ({
      id: mp.match.id,
      endedAt: mp.match.endedAt,
      rank: mp.rank,
      isWinner: mp.isWinner,
      coins: mp.coins,
      players: mp.match.players.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        rank: p.rank,
        isWinner: p.isWinner,
        coins: p.coins,
      })),
    }));
  }
}
