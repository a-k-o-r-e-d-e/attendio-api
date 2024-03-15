import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostGISExtension1710546768616 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
