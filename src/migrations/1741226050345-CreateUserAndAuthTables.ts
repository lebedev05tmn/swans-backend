import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndAuthTables1741226050345
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "user_id" character varying NOT NULL,
                "refresh_token" character varying,
                CONSTRAINT "PK_user_id" PRIMARY KEY ("user_id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "auth" (
                "auth_id" SERIAL NOT NULL,
                "service_user_id" character varying NOT NULL,
                "service_name" text NOT NULL,
                "userUserId" character varying,
                CONSTRAINT "PK_auth_id" PRIMARY KEY ("auth_id"),
                CONSTRAINT "FK_auth_userUserId" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auth"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
