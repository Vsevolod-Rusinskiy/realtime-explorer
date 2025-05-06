import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_, IntColumn as IntColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Transaction} from "./transaction.model"
import {Event} from "./event.model"

@Entity_()
export class Block {
    constructor(props?: Partial<Block>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    number!: bigint

    @StringColumn_({nullable: false})
    hash!: string

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: true})
    validator!: string | undefined | null

    @StringColumn_({nullable: true})
    status!: string | undefined | null

    @IntColumn_({nullable: true})
    size!: number | undefined | null

    @OneToMany_(() => Transaction, e => e.block)
    transactions!: Transaction[]

    @OneToMany_(() => Event, e => e.block)
    events!: Event[]
}
