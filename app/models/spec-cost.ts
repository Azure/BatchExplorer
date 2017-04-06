import { Record } from "immutable";

const SpecCostRecord = Record({
    id: null,
    statusCode: null,
    amount: null,
    currencyCode: null,
});


export interface SpecCostAttributes {
    id: string;
    statusCode: number;
    amount: number;
    currencyCode: string;
}

export class SpecCost extends SpecCostRecord {
    public id: string;
    public statusCode: number;
    public amount: number;
    public currencyCode: string;

    constructor(data: SpecCostAttributes) {
        super(data);
    }
}
