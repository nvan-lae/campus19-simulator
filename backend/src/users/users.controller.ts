import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

// Configure multer for avatar uploads
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new BadRequestException('Only image files are allowed'), false);
  }
  cb(null, true);
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Get my own profile (Protected)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    console.log('[Users] GET /me - user:', req.user?.username);
    // Strip password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = req.user || {};
    return safeUser;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/stats')
  async getMyStats(@Request() req) {
    console.log(`[Users] GET /me/stats - User ID: ${req.user.id}`);
    return this.usersService.getStats(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/matches')
  async getMyMatches(@Request() req) {
    console.log(`[Users] GET /me/matches - User ID: ${req.user.id}`);
    // Basic pagination could be added via query params later
    return this.usersService.getMatches(req.user.id);
  }

  // Upload avatar (Protected)
  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('[Avatar] Upload started', {
      userId: req.user.id,
      file: file?.filename,
    });

    try {
      if (!file) {
        console.log('[Avatar] No file uploaded');
        throw new BadRequestException('No file uploaded');
      }

      const avatarUrl = `/uploads/avatars/${file.filename}`;
      console.log('[Avatar] Updating user with URL:', avatarUrl);

      const updatedUser = await this.usersService.update(req.user.id, {
        avatarUrl,
      });

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      console.log('[Avatar] Upload successful');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = updatedUser;
      return safeUser;
    } catch (error) {
      console.error('[Avatar] Upload error:', error);
      throw error;
    }
  }

  // Delete avatar (Protected)
  @UseGuards(AuthGuard('jwt'))
  @Post('avatar/delete')
  async deleteAvatar(@Request() req) {
    console.log('[Avatar] Delete started', { userId: req.user.id });

    try {
      const updatedUser = await this.usersService.update(req.user.id, {
        avatarUrl: null,
      });

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      console.log('[Avatar] Delete successful');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = updatedUser;
      return safeUser;
    } catch (error) {
      console.error('[Avatar] Delete error:', error);
      throw error;
    }
  } // Find a specific user by ID (Public or Protected, your choice)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user || {};
    return safeUser;
  }
}
