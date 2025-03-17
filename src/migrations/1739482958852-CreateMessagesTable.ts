import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';
import { chatsTableName, messagesTableName } from './shared/utils';

export class CreateMessagesTable1739482958852 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: messagesTableName,
                columns: [
                    {
                        name: 'message_id',
                        type: 'int',
                        isPrimary: true,
                    },
                    {
                        name: 'chat_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sender_id',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'recipient_id',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'message_text',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'sending_time',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'is_readen',
                        type: 'boolean',
                        isNullable: false,
                    },
                    {
                        name: 'reading_time',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(messagesTableName, 'chat_id');
        await queryRunner.dropTable(messagesTableName);
    }
}
