import { Controller, Get, Post, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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
  constructor(private readonly usersService: UsersService) {}

  // Get my own profile (Protected)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    console.log('[Users] GET /me - user:', req.user?.username);
    return req.user;
  }

  // Upload avatar (Protected)
  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('[Avatar] Upload started', { userId: req.user.id, file: file?.filename });
    
    if (!file) {
      console.log('[Avatar] No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    try {
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      console.log('[Avatar] Updating user with URL:', avatarUrl);
      
      const updatedUser = await this.usersService.update(req.user.id, {
        avatarUrl,
      });
      
      console.log('[Avatar] Upload successful');
      return updatedUser;
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
      
      console.log('[Avatar] Delete successful');
      return updatedUser;
    } catch (error) {
      console.error('[Avatar] Delete error:', error);
      throw error;
    }
  }  // Find a specific user by ID (Public or Protected, your choice)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
