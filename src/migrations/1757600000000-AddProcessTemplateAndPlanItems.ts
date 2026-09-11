import { MigrationInterface, QueryRunner } from 'typeorm';

const POUCH_FIELD_TO_KEY: Record<string, string> = {
  mixing_cathode: 'Electrode_Slurry Mixing_Cathode',
  mixing_anode: 'Electrode_Slurry Mixing_Anode',
  coating_cathode: 'Electrode_Coating_Cathode',
  coating_anode: 'Electrode_Coating_Anode',
  calendering_cathode: 'Electrode_Calendering_Cathode',
  calendering_anode: 'Electrode_Calendering_Anode',
  notching_cathode: 'Electrode_Notching_Cathode',
  notching_anode: 'Electrode_Notching_Anode',
  pouch_forming: 'Cell Assembly_Pouch Forming',
  vacuum_drying_cathode: 'Cell Assembly_Vacuum Drying_Cathode',
  vacuum_drying_anode: 'Cell Assembly_Vacuum Drying_Anode',
  stacking: 'Cell Assembly_Stacking',
  tab_welding: 'Cell Assembly_Tab Welding',
  sealing: 'Cell Assembly_Sealing',
  el_filling: 'Cell Assembly_E/L Filling',
  pf_mf: 'Cell Formation_PF/MF',
  grading: 'Cell Formation_Grading',
};

const POUCH_TEMPLATE_ITEMS: { group: string; name: string; types: string; order: number }[] = [
  { group: 'Electrode', name: 'Slurry Mixing', types: 'Cathode,Anode', order: 1 },
  { group: 'Electrode', name: 'Coating', types: 'Cathode,Anode', order: 2 },
  { group: 'Electrode', name: 'Calendering', types: 'Cathode,Anode', order: 3 },
  { group: 'Electrode', name: 'Notching', types: 'Cathode,Anode', order: 4 },
  { group: 'Cell Assembly', name: 'Pouch Forming', types: '', order: 5 },
  { group: 'Cell Assembly', name: 'Vacuum Drying', types: 'Cathode,Anode', order: 6 },
  { group: 'Cell Assembly', name: 'Stacking', types: '', order: 7 },
  { group: 'Cell Assembly', name: 'Tab Welding', types: '', order: 8 },
  { group: 'Cell Assembly', name: 'Sealing', types: '', order: 9 },
  { group: 'Cell Assembly', name: 'E/L Filling', types: '', order: 10 },
  { group: 'Cell Formation', name: 'PF/MF', types: '', order: 11 },
  { group: 'Cell Formation', name: 'Grading', types: '', order: 12 },
];

export class AddProcessTemplateAndPlanItems1757600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "process_templates" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "form_factor" varchar(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "process_template_items" (
        "id" SERIAL PRIMARY KEY,
        "template_id" integer NOT NULL REFERENCES "process_templates"("id") ON DELETE CASCADE,
        "group" varchar(50) NOT NULL,
        "name" varchar(100) NOT NULL,
        "types" text NOT NULL DEFAULT '',
        "order" integer NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_plan_items" (
        "id" SERIAL PRIMARY KEY,
        "plan_id" integer NOT NULL REFERENCES "project_plans"("id") ON DELETE CASCADE,
        "key" varchar(200) NOT NULL,
        "start_date" date,
        "end_date" date
      )
    `);

    await queryRunner.query(`ALTER TABLE "project_plans" ADD COLUMN "template_id" integer REFERENCES "process_templates"("id") ON DELETE SET NULL`);

    const [{ id: templateId }] = await queryRunner.query(
      `INSERT INTO "process_templates" ("name", "form_factor") VALUES ('파우치형 표준', '파우치형') RETURNING id`,
    );

    for (const item of POUCH_TEMPLATE_ITEMS) {
      await queryRunner.query(
        `INSERT INTO "process_template_items" ("template_id", "group", "name", "types", "order") VALUES ($1, $2, $3, $4, $5)`,
        [templateId, item.group, item.name, item.types, item.order],
      );
    }

    const plans: Record<string, any>[] = await queryRunner.query(`SELECT * FROM "project_plans"`);

    for (const plan of plans) {
      await queryRunner.query(`UPDATE "project_plans" SET "template_id" = $1 WHERE "id" = $2`, [templateId, plan.id]);

      for (const [field, key] of Object.entries(POUCH_FIELD_TO_KEY)) {
        const value: string | null = plan[field];
        if (!value) continue;

        const [start, end] = value.includes('~') ? value.split('~').map((s) => s.trim()) : [value.trim(), value.trim()];

        await queryRunner.query(`INSERT INTO "project_plan_items" ("plan_id", "key", "start_date", "end_date") VALUES ($1, $2, $3, $4)`, [
          plan.id,
          key,
          start,
          end,
        ]);
      }
    }

    for (const field of Object.keys(POUCH_FIELD_TO_KEY)) {
      await queryRunner.query(`ALTER TABLE "project_plans" DROP COLUMN "${field}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const field of Object.keys(POUCH_FIELD_TO_KEY)) {
      await queryRunner.query(`ALTER TABLE "project_plans" ADD COLUMN "${field}" varchar`);
    }

    const items: Record<string, any>[] = await queryRunner.query(`SELECT * FROM "project_plan_items"`);
    const keyToField = Object.fromEntries(Object.entries(POUCH_FIELD_TO_KEY).map(([field, key]) => [key, field]));

    for (const item of items) {
      const field = keyToField[item.key];
      if (!field) continue;

      const value = item.start_date === item.end_date ? item.start_date : `${item.start_date}~${item.end_date}`;
      await queryRunner.query(`UPDATE "project_plans" SET "${field}" = $1 WHERE "id" = $2`, [value, item.plan_id]);
    }

    await queryRunner.query(`ALTER TABLE "project_plans" DROP COLUMN "template_id"`);
    await queryRunner.query(`DROP TABLE "project_plan_items"`);
    await queryRunner.query(`DROP TABLE "process_template_items"`);
    await queryRunner.query(`DROP TABLE "process_templates"`);
  }
}
