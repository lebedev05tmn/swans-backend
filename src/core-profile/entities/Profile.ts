import { profileTableName } from '../../shared/utils';
import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';

import { User } from '../../core-user/models/entities/User';

@Entity(profileTableName)
export class Profile extends BaseEntity {
    @PrimaryGeneratedColumn()
    profile_id!: number;

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ nullable: true })
    user_name!: string;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date;

    @Column({ nullable: true })
    sex!: 'male' | 'female';

    @Column({ type: 'text', array: true, nullable: true })
    images!: string[];

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'text', array: true, nullable: true })
    categories!: string[];

    @Column({ type: 'text', nullable: true })
    city!: string;}
