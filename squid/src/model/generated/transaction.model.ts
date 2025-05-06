import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Block} from "./block.model"
import {Account} from "./account.model"
import {Event} from "./event.model"

@Entity_()
export class Transaction {
    constructor(props?: Partial<Transaction>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Block, {nullable: true})
    block!: Block

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    from!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    to!: Account | undefined | null

    @BigIntColumn_({nullable: true})
    amount!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    fee!: bigint | undefined | null

    @StringColumn_({nullable: true})
    status!: string | undefined | null

    @StringColumn_({nullable: true})
    type!: string | undefined | null

    @StringColumn_({nullable: true})
    data!: string | undefined | null

    @OneToMany_(() => Event, e => e.transaction)
    events!: Event[]
}
