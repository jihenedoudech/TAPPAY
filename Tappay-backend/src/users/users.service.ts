import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storesService: StoresService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('createUserDto: ', createUserDto);
    const user = this.userRepository.create(createUserDto);
    if (createUserDto.assignedStoresIds) {
      const assignedStores = await this.storesService.findByIds(
        createUserDto.assignedStoresIds,
      );
      console.log('assignedStores: ', assignedStores);
      if (!assignedStores || assignedStores.length === 0) {
        throw new Error(
          'No valid assigned stores found. User creation aborted.',
        );
      }
      user.assignedStores = assignedStores;
    }
    console.log('user after assignedStores: ', user);
    return this.userRepository.save(user);
  }

  async validateUser(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async assignStoresToUser(userId: string, storeIds: number[]): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const stores = await this.storesService.findByIds(storeIds);
    if (stores.length !== storeIds.length) {
      throw new NotFoundException(`Some stores were not found`);
    }
    const newStores = stores.filter(
      (store) => !user.assignedStores.some((s) => s.id === store.id),
    );
    user.assignedStores = [...user.assignedStores, ...newStores];
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return 'Password changed successfully.';
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  findAll() {
    return this.userRepository.find({
      relations: ['address', 'assignedStores', 'storeInUse'],
    });
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['assignedStores'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Update other user fields
    Object.assign(user, updateUserDto);

    // Handle assignedStoresIds
    if (updateUserDto.assignedStoresIds) {
      const updatedStores = await this.storesService.findByIds(
        updateUserDto.assignedStoresIds,
      );

      if (
        !updatedStores ||
        updatedStores.length !== updateUserDto.assignedStoresIds.length
      ) {
        throw new NotFoundException('Some stores were not found.');
      }

      user.assignedStores = updatedStores;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    user.isActive = false;
    await this.userRepository.save(user);
    await this.userRepository.softRemove(user);

    return `User with ID ${id} has been deactivated.`;
  }
}
