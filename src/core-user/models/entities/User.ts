import { Entity, PrimaryColumn, BaseEntity, OneToMany, Column } from 'typeorm';
import { Exclude, Type } from 'class-transformer';

import { Auth } from '../../../core-auth/models/entities/Auth';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id!: string;

    @Column({ nullable: true })
    refresh_token!: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    geolocation!: any;

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

    @OneToMany(() => Auth, (auth) => auth.user, { cascade: true, eager: false })
    @Type(() => User)
    @Exclude({ toPlainOnly: true })
    resources!: Auth[];
}
