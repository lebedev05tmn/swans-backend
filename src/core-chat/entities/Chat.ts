import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { chatsTableName } from '../../shared/utils';
import { IMessage } from '../utils';

@Entity(chatsTableName)
export class Chat extends BaseEntity {
    @PrimaryGeneratedColumn()
    chat_id!: number;

    @Column()
    user1_id!: string;

    @Column()
    user2_id!: string;

    @Column({ type: 'jsonb', nullable: true, default: () => `'[]'` })
    messages!: IMessage[] | null;
}
