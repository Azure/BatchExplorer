import { Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { JobAction } from "./job-action";

export interface ExitOptionsAttributes {
    jobAction: JobAction;
}

@Model()
export class ExitOptions extends Record<ExitOptionsAttributes> {
    public jobAction: JobAction;
}

export interface ExitCodeMappingAttributes {
    code: number;
    exitOptions: ExitOptionsAttributes;
}

@Model()
export class ExitCodeMapping extends Record<ExitCodeMappingAttributes> {
    public code: number;
    public exitOptions: ExitOptions;
}

export interface ExitCodeRangeMappingAttributes {
    start: number;
    end: number;
    exitOptions: ExitOptionsAttributes;
}

@Model()
export class ExitCodeRangeMapping extends Record<ExitCodeRangeMappingAttributes> {
    @Prop() public start: number;
    @Prop() public end: number;
    @Prop() public exitOptions: ExitOptions;
}

export interface TaskExitConditionsAttributes {
    exitCodes: ExitCodeMappingAttributes[];
    exitCodeRanges: ExitCodeRangeMappingAttributes[];
    failureInfo: ExitOptions;
    default: ExitOptions;
}

@Model()
export class TaskExitConditions extends Record<TaskExitConditionsAttributes> {
    @Prop() public exitCodes: List<ExitCodeMapping>;
    @Prop() public exitCodeRanges: List<ExitCodeRangeMapping>;
    @Prop() public failureInfo: ExitOptions;
    @Prop() public default: ExitOptions;
}
