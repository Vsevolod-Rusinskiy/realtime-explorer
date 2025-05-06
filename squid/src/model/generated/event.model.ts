import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"
import {Block} from "./block.model"
import {Transaction} from "./transaction.model"

@Entity_()
export class Event {
    constructor(props?: Partial<Event>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Block, {nullable: true})
    block!: Block

    @Index_()
    @ManyToOne_(() => Transaction, {nullable: true})
    transaction!: Transaction | undefined | null

    @StringColumn_({nullable: true})
    section!: string | undefined | null

    @StringColumn_({nullable: true})
    method!: string | undefined | null

    @StringColumn_({nullable: true})
    data!: string | undefined | null
}
