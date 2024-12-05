import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity('person')
export class Profile extends BaseEntity {
    @PrimaryColumn()
    user_id!: number;

    @Column({ nullable: true })
    user_name!: string;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date;

    @Column({ nullable: true })
    sex!: string;

    @Column({ type: 'jsonb', nullable: true })
    images!: string[];

    @Column({ type: 'text', nullable: true })
    short_desc!: string;

    @Column({ type: 'text', nullable: true })
    long_desc!: string;

    @Column({ type: 'jsonb', nullable: true })
    categories!: any[];
}
