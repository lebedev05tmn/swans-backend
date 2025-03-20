import { Entity, PrimaryColumn, BaseEntity, OneToMany, Column } from 'typeorm';
import { Exclude, Type } from 'class-transformer';

import { Auth } from '../../../core-auth/models/entities/Auth';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id!: string;

    @Column({ nullable: true })
    refresh_token!: string;

    @OneToMany(() => Auth, (auth) => auth.user, { cascade: true, eager: false })
    @Type(() => User)
    @Exclude({ toPlainOnly: true })
    resources!: Auth[];
}
