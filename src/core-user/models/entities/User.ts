import { Entity, PrimaryColumn, BaseEntity, OneToMany, Column, OneToOne, BeforeUpdate } from 'typeorm';

import { Auth } from '../../../core-auth/models/entities/Auth';
import { Profile } from '../../../core-profile/entities/Profile';
import { PointTransformer } from '../../../shared/model/transformers';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id!: string;

    @Column({ nullable: true })
    refresh_token!: string;

    @Column({ nullable: true, type: 'point', transformer: PointTransformer })
    geolocation!: { x: number; y: number } | null;

    @Column({ nullable: true })
    online!: boolean;

    @Column({ nullable: true })
    last_visit!: Date;

    @Column({ nullable: true })
    verify!: boolean;

    @Column({ nullable: true })
    premium!: boolean;

    @Column({ nullable: true })
    super_likes!: number;

    @Column({ nullable: true })
    returns!: number;

    @Column({ nullable: true })
    background_mode!: boolean;

    @Column({ nullable: true })
    locale!: string;

    @Column({ nullable: true })
    banned!: boolean;

    @Column({ nullable: true })
    reported!: number;

    @Column({ nullable: true, type: 'text' })
    socket_id!: string;

    @Column({ nullable: true })
    dating_last_time!: Date;

    @Column({ nullable: true })
    timezone!: string;

    @BeforeUpdate()
    updateLastVisit() {
        if (this.online === false) {
            this.last_visit = new Date(Date.now());
        }
    }

    @OneToMany(() => Auth, (auth) => auth.user, { cascade: true, eager: false })
    resources!: Auth[];

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: true,
        eager: false,
    })
    profile!: Profile;
}
