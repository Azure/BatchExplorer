import { ListProp, Model, Prop, Record, ServerError } from "@batch-flask/core";
import { List } from "immutable";
import { NameValuePair, NameValuePairAttributes } from "../name-value-pair";

interface AutoScaleForumlaAttributes {
    results?: NameValuePairAttributes[];
    error?: ServerError;
}

@Model()
export class AutoScaleFormulaEvaluation extends Record<AutoScaleForumlaAttributes> {
    @ListProp(NameValuePair) public results: List<NameValuePair>;
    @Prop() public error: ServerError;
}
