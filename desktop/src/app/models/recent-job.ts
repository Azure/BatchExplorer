import { Model, Record, Prop } from "@batch-flask/core/record";

export interface RecentJobAttributes {
    id: string;
    url: string;
}

/**
 * Contains information about the most recent job to un udner the job schedule d in the Azure
 */
@Model()
export class RecentJob extends Record<RecentJobAttributes> {
    @Prop() public id: string;
    @Prop() public url: string;
}
