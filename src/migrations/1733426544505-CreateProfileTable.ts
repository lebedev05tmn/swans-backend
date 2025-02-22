import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { profileTableName } from './shared/utils';

export class CreateProfileTable1733426544505 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: profileTableName,
                columns: [
                    {
                        name: 'user_id',
                        type: 'text',
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
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'categories',
                        type: 'text[]',
                        isNullable: true,
                    },
                    {
                        name: 'geolocation',
                        type: 'geometry',
                        spatialFeatureType: 'Point',
                        srid: 4326,
                        isNullable: true,
                    },
                    {
                        name: 'city',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'socket_id',
                        type: 'text',
                        isNullable: true,
                    },
                ],
            }),
        );
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(profileTableName);
    }
}
