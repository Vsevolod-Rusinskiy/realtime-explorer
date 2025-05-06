module.exports = class Data1746527823551 {
    name = 'Data1746527823551'

    async up(db) {
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "balance" numeric, "updated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "event" ("id" character varying NOT NULL, "section" text, "method" text, "data" text, "block_id" character varying, "transaction_id" character varying, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_2b0d35d675c4f99751855c4502" ON "event" ("block_id") `)
        await db.query(`CREATE INDEX "IDX_036de8e23f40b48f0b672e2a2b" ON "event" ("transaction_id") `)
        await db.query(`CREATE TABLE "transaction" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric, "fee" numeric, "status" text, "type" text, "data" text, "block_id" character varying, "from_id" character varying, "to_id" character varying, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_c0e1460f3c9eee975fee81002d" ON "transaction" ("block_id") `)
        await db.query(`CREATE INDEX "IDX_99298f25613c7c4d7c8a77f9a4" ON "transaction" ("from_id") `)
        await db.query(`CREATE INDEX "IDX_7de44fdf7c9e64d9fd4b8a1de3" ON "transaction" ("to_id") `)
        await db.query(`CREATE TABLE "block" ("id" character varying NOT NULL, "number" numeric NOT NULL, "hash" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "validator" text, "status" text, "size" integer, CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "statistics" ("id" character varying NOT NULL, "total_blocks" integer, "total_transactions" integer, "total_accounts" integer, "average_block_time" numeric, "last_block" integer, "updated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c3769cca342381fa827a0f246a7" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_2b0d35d675c4f99751855c45021" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_036de8e23f40b48f0b672e2a2b6" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_c0e1460f3c9eee975fee81002dc" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_99298f25613c7c4d7c8a77f9a40" FOREIGN KEY ("from_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_7de44fdf7c9e64d9fd4b8a1de36" FOREIGN KEY ("to_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "account"`)
        await db.query(`DROP TABLE "event"`)
        await db.query(`DROP INDEX "public"."IDX_2b0d35d675c4f99751855c4502"`)
        await db.query(`DROP INDEX "public"."IDX_036de8e23f40b48f0b672e2a2b"`)
        await db.query(`DROP TABLE "transaction"`)
        await db.query(`DROP INDEX "public"."IDX_c0e1460f3c9eee975fee81002d"`)
        await db.query(`DROP INDEX "public"."IDX_99298f25613c7c4d7c8a77f9a4"`)
        await db.query(`DROP INDEX "public"."IDX_7de44fdf7c9e64d9fd4b8a1de3"`)
        await db.query(`DROP TABLE "block"`)
        await db.query(`DROP TABLE "statistics"`)
        await db.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_2b0d35d675c4f99751855c45021"`)
        await db.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_036de8e23f40b48f0b672e2a2b6"`)
        await db.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_c0e1460f3c9eee975fee81002dc"`)
        await db.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_99298f25613c7c4d7c8a77f9a40"`)
        await db.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_7de44fdf7c9e64d9fd4b8a1de36"`)
    }
}
