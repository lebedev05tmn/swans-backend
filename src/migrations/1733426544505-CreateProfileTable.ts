import { MigrationInterface, QueryRunner, Table } from 'typeorm';

let tableName = 'profile';

export class CreateProfileTable1733426544505 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.createTable(
                new Table({
                    name: tableName,
                    columns: [
                        {
                            name: 'user_id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: false,
                        },
                        {
                            name: 'user_name',
                            type: 'varchar',
                            length: '25',
                            isNullable: true,
                        },
                        {
                            name: 'birth_date',
                            type: 'date',
                            isNullable: true,
                        },
                        {
                            name: 'sex',
                            type: 'boolean',
                            isNullable: true,
                        },
                        {
                            name: 'images',
                            type: 'text[4]',
                            isNullable: true,
                        },
                        {
                            name: 'short_desc',
                            type: 'varchar',
                            length: '100',
                            isNullable: true,
                        },
                        {
                            name: 'long_desc',
                            type: 'text',
                            isNullable: true,
                        },
                        {
                            name: 'categories',
                            type: 'text[]',
                            isNullable: true,
                        },
                    ],
                }),
            );
        } catch (error) {
            if ((error as { message: string }).message.includes('already exists')) {
                console.error(`The table "${tableName}" already exists`);
            } else {
                console.error(`Failed to create table "${tableName}"`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.dropTable(tableName);
        } catch (error) {
            if ((error as { message: string }).message.includes('does not exist')) {
                console.error(`The table "${tableName}" does not exist`);
            } else {
                console.error(`Failed to delete table "${tableName}"`);
            }
        }
    }
}
