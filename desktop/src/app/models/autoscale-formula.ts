import { Model, Record, Prop } from "@batch-flask/core/record";
import { SecureUtils } from "@batch-flask/utils";

export interface AutoscaleFormulaAttributes {
    id: string;
    name: string;
    value: string;
}

@Model()
export class AutoscaleFormula extends Record<AutoscaleFormulaAttributes> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public value: string;

    constructor(data: Partial<AutoscaleFormulaAttributes>) {
        super({
            id: SecureUtils.uuid(),
            ...data,
        });
    }
}
