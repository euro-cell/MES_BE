import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductionToProject1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 테이블 이름 변경
    await queryRunner.query(`ALTER TABLE "productions" RENAME TO "projects"`);
    await queryRunner.query(`ALTER TABLE "production_plans" RENAME TO "project_plans"`);
    await queryRunner.query(`ALTER TABLE "production_materials" RENAME TO "project_materials"`);
    await queryRunner.query(`ALTER TABLE "production_specifications" RENAME TO "project_specifications"`);
    await queryRunner.query(`ALTER TABLE "production_targets" RENAME TO "project_targets"`);

    // 2. FK 컬럼명 변경 (production_id → project_id)
    await queryRunner.query(`ALTER TABLE "project_plans" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "project_materials" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "project_specifications" RENAME COLUMN "productionId" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "project_targets" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "specifications" RENAME COLUMN "productionId" TO "project_id"`);

    // 3. 다른 테이블의 production_id 컬럼 rename
    await queryRunner.query(`ALTER TABLE "iqc" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "lqc_spec" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "oqc_spec" RENAME COLUMN "production_id" TO "project_id"`);
    await queryRunner.query(`ALTER TABLE "lot_syncs" RENAME COLUMN "production_id" TO "project_id"`);

    // 4. worklog 테이블들의 production_id → project_id
    const worklogTables = [
      'worklog_binders', 'worklog_slurries', 'worklog_coatings', 'worklog_presses',
      'worklog_notchings', 'worklog_vds', 'worklog_formings', 'worklog_stackings',
      'worklog_weldings', 'worklog_sealings', 'worklog_fillings', 'worklog_formations',
      'worklog_gradings', 'worklog_visual_inspections',
    ];
    for (const table of worklogTables) {
      await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "production_id" TO "project_id"`);
    }

    // 5. lot 테이블들의 production_id → project_id
    const lotTables = [
      'lot_mixings', 'lot_coatings', 'lot_presses', 'lot_notchings',
      'lot_stackings', 'lot_weldings', 'lot_sealings', 'lot_formations',
    ];
    for (const table of lotTables) {
      await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "production_id" TO "project_id"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // lot 테이블 rollback
    const lotTables = [
      'lot_mixings', 'lot_coatings', 'lot_presses', 'lot_notchings',
      'lot_stackings', 'lot_weldings', 'lot_sealings', 'lot_formations',
    ];
    for (const table of lotTables) {
      await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "project_id" TO "production_id"`);
    }

    // worklog 테이블 rollback
    const worklogTables = [
      'worklog_binders', 'worklog_slurries', 'worklog_coatings', 'worklog_presses',
      'worklog_notchings', 'worklog_vds', 'worklog_formings', 'worklog_stackings',
      'worklog_weldings', 'worklog_sealings', 'worklog_fillings', 'worklog_formations',
      'worklog_gradings', 'worklog_visual_inspections',
    ];
    for (const table of worklogTables) {
      await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "project_id" TO "production_id"`);
    }

    await queryRunner.query(`ALTER TABLE "lot_syncs" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "oqc_spec" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "lqc_spec" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "iqc" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "specifications" RENAME COLUMN "project_id" TO "productionId"`);
    await queryRunner.query(`ALTER TABLE "project_targets" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "project_specifications" RENAME COLUMN "project_id" TO "productionId"`);
    await queryRunner.query(`ALTER TABLE "project_materials" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "project_plans" RENAME COLUMN "project_id" TO "production_id"`);
    await queryRunner.query(`ALTER TABLE "project_targets" RENAME TO "production_targets"`);
    await queryRunner.query(`ALTER TABLE "project_specifications" RENAME TO "production_specifications"`);
    await queryRunner.query(`ALTER TABLE "project_materials" RENAME TO "production_materials"`);
    await queryRunner.query(`ALTER TABLE "project_plans" RENAME TO "production_plans"`);
    await queryRunner.query(`ALTER TABLE "projects" RENAME TO "productions"`);
  }
}
