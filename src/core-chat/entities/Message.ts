import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { messagesTableName } from '../../shared/utils';
import { Chat } from './Chat';

@Entity(messagesTableName)
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    message_id!: number;

    @Column()
    chat_id!: number;

    @Column()
    sender_id!: string;

    @Column()
    recipient_id!: string;

    @Column()
    message!: string;
}
