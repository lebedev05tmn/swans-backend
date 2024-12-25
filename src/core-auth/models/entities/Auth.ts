import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from "typeorm";

import { User } from "../../../core-user/models/entities/User";


@Entity('auth')
export class Auth extends BaseEntity {
    @PrimaryGeneratedColumn()
    auth_id!: number;
    
    @ManyToOne(() => User, (user) => user.resources, { onDelete: 'CASCADE' })
    user!: User;

    @Column({ nullable: false })
    service_user_id!: number;

    @Column({ type: 'text', nullable: false })
    service_name!: string;

}
