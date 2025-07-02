import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class CreateUserAndAuthTables1741226050345 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const userTableExists = await queryRunner.hasTable('user');
        const authTableExists = await queryRunner.hasTable('auth');

        if (!userTableExists) {
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
        }

        // AlterTable для USER
        const userTable = await queryRunner.getTable('user');
        if (!userTable?.columns.find((column) => column.name === 'refresh_token')) {
            await queryRunner.addColumn(
                'user',
                new TableColumn({
                    name: 'refresh_token',
                    type: 'varchar',
                    isNullable: true,
                }),
            );
        }

        if (!authTableExists) {
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
        }

        // AlterTable для AUTH
        const authTable = await queryRunner.getTable('auth');
        if (!authTable?.columns.find((column) => column.name === 'service_user_id')) {
            await queryRunner.addColumn(
                'auth',
                new TableColumn({
                    name: 'service_user_id',
                    type: 'varchar',
                    isNullable: false,
                }),
            );
        }
        if (!authTable?.columns.find((column) => column.name === 'service_name')) {
            await queryRunner.addColumn(
                'auth',
                new TableColumn({
                    name: 'service_name',
                    type: 'text',
                    isNullable: false,
                }),
            );
        }
        if (!authTable?.columns.find((column) => column.name === 'userUserId')) {
            await queryRunner.addColumn(
                'auth',
                new TableColumn({
                    name: 'userUserId',
                    type: 'varchar',
                    isNullable: true,
                }),
            );
        }

        if (userTableExists && authTableExists) {
            const authTable = await queryRunner.getTable('auth');
            const foreignKey = authTable?.foreignKeys.find((fk) => fk.columnNames.indexOf('userUserId') !== -1);
            if (!foreignKey) {
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
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('auth');
        await queryRunner.dropTable('user');
    }
}
