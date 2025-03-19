import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    ManyToOne,
} from 'typeorm';

import { User } from '../../../core-user/models/entities/User';

@Entity('auth')
export class Auth extends BaseEntity {
    @PrimaryGeneratedColumn()
    auth_id!: number;

    @ManyToOne(() => User, (user) => user.resources, { onDelete: 'CASCADE', eager: false })
    user!: User;

    @Column({ nullable: false })
    service_user_id!: string;

    @Column({ type: 'text', nullable: false })
    service_name!: string;
}
