import {
    Entity,
    PrimaryColumn,
    BaseEntity,
    OneToMany,
    Column,
    OneToOne,
} from 'typeorm';

import { Auth } from '../../../core-auth/models/entities/Auth';
import { Profile } from '../../../core-profile/entities/Profile';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id!: string;

    @Column({ nullable: true })
    refresh_token!: string;

    @OneToMany(() => Auth, (auth) => auth.user, { cascade: true, eager: false })
    resources!: Auth[];

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: true,
        eager: false,
    })
    profile!: Profile;
}
