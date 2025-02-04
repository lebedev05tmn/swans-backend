import { profileTableName } from '../../shared/utils';
import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity(profileTableName)
export class Profile extends BaseEntity {
    @PrimaryColumn()
    user_id!: number;

    @Column({ nullable: true })
    user_name!: string;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date;

    @Column({ nullable: true })
    sex!: boolean;

    @Column({ type: 'text', array: true, nullable: true })
    images!: string[];

    @Column({ nullable: true })
    short_desc!: string;

    @Column({ type: 'text', nullable: true })
    long_desc!: string;

    @Column({ type: 'text', array: true, nullable: true })
    categories!: string[];

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    geolocation!: any;

    @Column({ type: 'text', nullable: true })
    city!: string;
}
