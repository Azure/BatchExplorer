import { Record } from "immutable";

import { ComputeNodeInformation } from "./compute-node-information";
import { SchedulingError } from "./scheduling-error";
import { TaskState } from "./task";

// tslint:disable:variable-name
const SubtaskRecord = Record({
    id: null,
    startTime: null,
    endTime: null,
    exitCode: null,
    state: null,
    stateTransitionTime: null,
    previousState: null,
    previousStateTransitionTime: null,
    nodeInfo: null,
    schedulingError: null,
});

/**
 * Class for displaying MPI sub task information.
 */
export class SubtaskInformation extends SubtaskRecord {
    public id: string;
    public startTime: Date;
    public endTime: Date;
    public exitCode: number;
    public state: TaskState;
    public stateTransitionTime: Date;
    public previousState: TaskState;
    public previousStateTransitionTime: Date;

    public nodeInfo: ComputeNodeInformation;
    public schedulingError: SchedulingError;
}
