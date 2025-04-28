import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('current-user')
  async currentUser(@Request() req) {
    return this.authService.currentUser(req);
  }

  @Public()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(
      loginUserDto.username,
      loginUserDto.password,
    );
    return result;
  }

  @Get('logout')
  async logout(
    @Request() req
  ) {
    const userId = req.user.id;
    return this.authService.logout(userId);
  }
}
