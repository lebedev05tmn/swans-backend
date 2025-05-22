import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { chatsTableName } from './shared/utils';

export class CreateChatsTable1739481015680 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: chatsTableName,
                columns: [
                    {
                        name: 'chat_id',
                        type: 'serial',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user1_id',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'user2_id',
                        type: 'text',
                        isNullable: false,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(chatsTableName);
    }
}
