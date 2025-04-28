import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    fullAddress: string;
    
    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    street: string;

    @Column({ nullable: true })
    zip: string;
}
