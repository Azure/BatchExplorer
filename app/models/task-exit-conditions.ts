import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { JobAction } from "./job-action";

export enum DependencyAction {
    Block = "block",
    Satisfy = "satisfy",
}

export interface ExitOptionsAttributes {
    jobAction: JobAction;
    dependencyAction: DependencyAction;
}

@Model()
export class ExitOptions extends Record<ExitOptionsAttributes> {
    @Prop() public jobAction: JobAction;
    @Prop() public dependencyAction: DependencyAction;
}

export interface ExitCodeMappingAttributes {
    code: number;
    exitOptions: ExitOptionsAttributes;
}

@Model()
export class ExitCodeMapping extends Record<ExitCodeMappingAttributes> {
    @Prop() public code: number;
    @Prop() public exitOptions: ExitOptions;
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
    @ListProp(ExitCodeRangeMapping) public exitCodeRanges: List<ExitCodeRangeMapping> = List([]);
    @Prop() public fileUploadError: ExitOptions;
    @Prop() public preProcessingError: ExitOptions;
    @Prop() public default: ExitOptions;
}
