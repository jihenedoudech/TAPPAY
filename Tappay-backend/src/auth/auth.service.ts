import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StoresService } from '../stores/stores.service';
import { ShiftsService } from '../shifts/shifts.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly storesService: StoresService,
    private readonly shiftsService: ShiftsService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      return null;
    }
    const { password: userPassword, ...result } = user;
    return result;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.isConnected = true;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const payload = { id: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        // expiresIn: '1h',
      }),
    };
  }

  async currentUser(req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
      relations: ['address', 'assignedStores', 'shifts', 'storeInUse'],
    });
    return user;
  }

  async logout(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shift = await this.shiftsService.findCurrent(userId);
      if (shift) {
        const closedShift = await this.shiftsService.close(
          shift.id,
          queryRunner,
        );
        console.log('closedShift: ', closedShift);
      }
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      user.isConnected = false;
      user.storeInUse = null;

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
