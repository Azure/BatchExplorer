import { Model, Prop, Record } from "app/core";

export interface SpecCostAttributes {
    id: string;
    statusCode: number;
    amount: number;
    currencyCode: string;
}

@Model()
export class SpecCost extends Record<SpecCostAttributes> {
    @Prop() public id: string;
    @Prop() public statusCode: number;
    @Prop() public amount: number;
    @Prop() public currencyCode: string;

    constructor(data: SpecCostAttributes) {
        super(data);
    }
}
