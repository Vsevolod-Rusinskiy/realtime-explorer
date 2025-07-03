module.exports = class UpdateStatistics1747068800000 {
    name = 'UpdateStatistics1747068800000'

    async up(db) {
        await db.query(`ALTER TABLE "statistics" RENAME COLUMN "updated_at" TO "last_updated"`)
        
        await db.query(`ALTER TABLE "statistics" ADD "total_extrinsics" numeric`)
        await db.query(`ALTER TABLE "statistics" ADD "total_events" numeric`)
        await db.query(`ALTER TABLE "statistics" ADD "total_transfers" numeric`)
        await db.query(`ALTER TABLE "statistics" ADD "total_withdraws" numeric`)
        
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_blocks" TYPE numeric`)
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_transactions" TYPE numeric`)
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_accounts" TYPE numeric`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "statistics" RENAME COLUMN "last_updated" TO "updated_at"`)
        
        await db.query(`ALTER TABLE "statistics" DROP COLUMN "total_extrinsics"`)
        await db.query(`ALTER TABLE "statistics" DROP COLUMN "total_events"`)
        await db.query(`ALTER TABLE "statistics" DROP COLUMN "total_transfers"`)
        await db.query(`ALTER TABLE "statistics" DROP COLUMN "total_withdraws"`)
        
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_blocks" TYPE integer`)
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_transactions" TYPE integer`)
        await db.query(`ALTER TABLE "statistics" ALTER COLUMN "total_accounts" TYPE integer`)
    }
}
