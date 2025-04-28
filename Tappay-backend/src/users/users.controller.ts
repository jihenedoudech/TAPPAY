import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Post('register')
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto in controller: ', createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new password are required.');
    }
    return this.usersService.changePassword(id, currentPassword, newPassword);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('id: ', id);
    console.log('updateUserDto: ', updateUserDto);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    console.log('id: ', id);
    return this.usersService.remove(id);
  }
}
