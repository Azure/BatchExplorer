import { Record } from "immutable";

import { SecureUtils } from "app/utils";

const AutoscaleFormulaRecord = Record({
    id: null,
    name: null,
    value: null,
});

export interface AutoscaleFormulaAttributes {
    id: string;
    name: string;
    value: string;
}

export class AutoscaleFormula extends AutoscaleFormulaRecord implements AutoscaleFormulaAttributes {
    public id: string;
    public name: string;
    public value: string;

    constructor(data: Partial<AutoscaleFormulaAttributes>) {
        super(Object.assign({}, {
            id: SecureUtils.uuid(),
        }, data));
    }
}
