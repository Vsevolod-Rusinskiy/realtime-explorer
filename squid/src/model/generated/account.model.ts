import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Transaction} from "./transaction.model"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: true})
    balance!: bigint | undefined | null

    @DateTimeColumn_({nullable: true})
    updatedAt!: Date | undefined | null

    @StringColumn_({nullable: true})
    testColumn!: string | undefined | null

    @OneToMany_(() => Transaction, e => e.from)
    transactionsFrom!: Transaction[]

    @OneToMany_(() => Transaction, e => e.to)
    transactionsTo!: Transaction[]
}
