import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Shift } from '../../shifts/entities/shift.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../auth/enums/role.enum';
import { Address } from '../../addresses/entities/address.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToOne(() => Address, { cascade: true, nullable: true })
  @JoinColumn()
  address: Address;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Role, default: Role.CASHIER })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: false })
  isConnected: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @CreateDateColumn()
  hiredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  terminatedAt: Date;

  @Column({ nullable: true })
  salaryAmount: number;

  @Column({ nullable: true })
  preferedLanguage: string;

  @OneToMany(() => Shift, (shift) => shift.user)
  shifts: Shift[];

  @ManyToMany(() => Store, (store) => store.users)
  @JoinTable()
  assignedStores: Store[];

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn()
  storeInUse: Store;
}
