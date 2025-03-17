import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { messagesTableName } from '../../shared/utils';
import { Chat } from './Chat';

@Entity(messagesTableName)
export class Message extends BaseEntity {
    @PrimaryColumn()
    message_id!: number;

    @Column()
    chat_id!: number;

    @Column()
    sender_id!: string;

    @Column()
    recipient_id!: string;

    @Column()
    message_text!: string;

    @Column()
    sending_time!: Date;

    @Column()
    is_readen!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    reading_time!: Date | null;
}
