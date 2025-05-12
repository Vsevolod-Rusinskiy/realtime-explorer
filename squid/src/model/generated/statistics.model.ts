import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Statistics {
    constructor(props?: Partial<Statistics>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: true})
    totalBlocks!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalTransactions!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalAccounts!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalExtrinsics!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalEvents!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalTransfers!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    totalWithdraws!: bigint | undefined | null

    @FloatColumn_({nullable: true})
    averageBlockTime!: number | undefined | null

    @IntColumn_({nullable: true})
    lastBlock!: number | undefined | null

    @DateTimeColumn_({nullable: true})
    lastUpdated!: Date | undefined | null
}
