import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class CreateUserAndAuthTables1741226050345
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user',
                columns: [
                    {
                        name: 'user_id',
                        type: 'varchar',
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: 'refresh_token',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createTable(
            new Table({
                name: 'auth',
                columns: [
                    {
                        name: 'auth_id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'service_user_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'service_name',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'userUserId',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'auth',
            new TableForeignKey({
                columnNames: ['userUserId'],
                referencedColumnNames: ['user_id'],
                referencedTableName: 'user',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('auth');
        await queryRunner.dropTable('user');
    }
}
