module.exports = class Data1746534869175 {
    name = 'Data1746534869175'

    async up(db) {
        await db.query(`ALTER TABLE "account" ADD "test_column" text`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "account" DROP COLUMN "test_column"`)
    }
}
