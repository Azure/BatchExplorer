import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { NameValuePair, NameValuePairAttributes } from "app/models/name-value-pair";
import { List } from "immutable";

export interface AutoScaleRunErrorAttributes {
    code: string;
    message: string;
    values: NameValuePairAttributes[];
}

@Model()
export class AutoScaleRunError extends Record<AutoScaleRunErrorAttributes> {
    @Prop() public code: string;
    @Prop() public message: string;
    @ListProp(NameValuePair) public values: List<NameValuePairAttributes> = List([]);
}

export interface AutoScaleRunAttributes {
    error: AutoScaleRunErrorAttributes;
    results: string;
    timestamp: Date;
}

@Model()
export class AutoScaleRun extends Record<AutoScaleRunAttributes> {
    @Prop() public error: AutoScaleRunError;
    @Prop() public results: string;
    @Prop() public timestamp: Date;
}
