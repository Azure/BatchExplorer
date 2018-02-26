import { Model, Prop, Record } from "app/core";

export interface BatchQuotasAttributes {
    pools: number;
    jobs: number;
    dedicatedCores: number;
    lowpriCores: number;
}

@Model()
export class BatchQuotas extends Record<BatchQuotasAttributes> {
    @Prop() public pools: number;
    @Prop() public jobs: number;
    @Prop() public dedicatedCores: number;
    @Prop() public lowpriCores: number;
}
