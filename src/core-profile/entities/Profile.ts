import { profileTableName } from '../../shared/utils';
import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity(profileTableName)
export class Profile extends BaseEntity {
    @PrimaryColumn({ type: 'text' })
    user_id!: string;

    @Column({ nullable: true })
    user_name!: string;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date;

    @Column({ nullable: true })
    sex!: boolean;

    @Column({ type: 'text', array: true, nullable: true })
    images!: string[];

    @Column({ type: 'text', nullable: true })
    description!: string | null;

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

    @Column({ type: 'text', nullable: true })
    socket_id!: string | null;
}
