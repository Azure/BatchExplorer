import { Model, Prop, Record } from "@batch-flask/core";

export interface BatchQuotasAttributes {
    pools: number;
    jobs: number;
    dedicatedCores: number;
    lowpriCores: number;
    applications: number;
}

@Model()
export class BatchQuotas extends Record<BatchQuotasAttributes> {
    @Prop() public pools: number;
    @Prop() public jobs: number;
    @Prop() public applications: number;
    @Prop() public dedicatedCores: number;
    @Prop() public lowpriCores: number;
}
