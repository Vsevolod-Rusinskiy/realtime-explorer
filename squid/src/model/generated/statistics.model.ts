import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, FloatColumn as FloatColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Statistics {
    constructor(props?: Partial<Statistics>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: true})
    totalBlocks!: number | undefined | null

    @IntColumn_({nullable: true})
    totalTransactions!: number | undefined | null

    @IntColumn_({nullable: true})
    totalAccounts!: number | undefined | null

    @FloatColumn_({nullable: true})
    averageBlockTime!: number | undefined | null

    @IntColumn_({nullable: true})
    lastBlock!: number | undefined | null

    @DateTimeColumn_({nullable: true})
    updatedAt!: Date | undefined | null
}
