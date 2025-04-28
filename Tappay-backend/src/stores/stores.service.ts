import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    console.log('createStoreDto :', createStoreDto);
    const store = this.storeRepository.create(createStoreDto);
    const savedStore = await this.storeRepository.save(store);
    console.log('savedStore :', savedStore);
    const adminUsers = await this.userRepository.find({
      where: { role: Role.ADMIN },
      relations: ['assignedStores'],
    });
    console.log('adminUsers :', adminUsers);
    for (const admin of adminUsers) {
      if (!admin.assignedStores.some((s) => s.id === savedStore.id)) {
        admin.assignedStores.push(savedStore);
        await this.userRepository.save(admin);
      }
    }
    console.log('adminUsers after:', adminUsers);
    return savedStore;
  }

  async save(store: Store): Promise<Store> {
    return this.storeRepository.save(store);
  }

  async selectStore(storeId: string, req) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
      relations: ['storeInUse'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // req.session.storeId = storeId;
    // if (req.session.storeId !== storeId) {
    //   throw new Error('Failed to save storeId to session');
    // }
    console.log('user :', user);
    console.log('store :', store);
    user.storeInUse = store;
    const savedUser = await this.userRepository.save(user);
    console.log('savedUser :', savedUser);
    store.isOpen = true;
    const savedStore = await this.storeRepository.save(store);
    console.log('savedStore :', savedStore);
    return savedStore;
  }

  findAll() {
    return this.storeRepository.find({ relations: ['address', 'users'] });
  }

  async findOne(storeId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store)
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    return store;
  }

  findByIds(ids: number[]) {
    return this.storeRepository.find({ where: { id: In(ids) } });
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    return this.storeRepository.update(id, updateStoreDto);
  }

  remove(id: string) {
    return this.storeRepository.delete(id);
  }
}
