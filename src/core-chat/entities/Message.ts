import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { messagesTableName } from '../../shared/utils';

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

    @Column({ type: 'timestamp with time zone' })
    sending_time!: Date;

    @Column()
    is_readen!: boolean;

    @Column({ type: 'text', array: true, nullable: true })
    images!: string[] | null;

    @Column({ type: 'integer', nullable: true })
    response_message_id!: number | null;

    @Column({ type: 'text', nullable: true })
    reaction_sender!: string | null;

    @Column({ type: 'text', nullable: true })
    reaction_recipient!: string | null;
}
