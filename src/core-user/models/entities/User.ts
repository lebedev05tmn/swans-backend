import { Entity, PrimaryColumn, BaseEntity, OneToMany } from "typeorm";

import { Auth } from '../../../core-auth/models/entities/Auth'


@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id!: string;

    @OneToMany(() => Auth, (auth) => auth.user, { cascade: true })
    resources!: Auth[];
}
