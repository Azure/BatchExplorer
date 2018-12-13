import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";
import * as moment from "moment";

export enum NodeDeallocationOption {
    requeue = "requeue",
    terminate = "terminate",
    taskcompletion = "taskcompletion",
    retaineddata = "retaineddata",
}

export class PoolResizeDto extends Dto<PoolResizeDto> {
    @DtoAttr()
    public nodeDeallocationOption: NodeDeallocationOption;

    @DtoAttr(moment.duration)
    public resizeTimeout?: Duration;

    @DtoAttr()
    public targetDedicatedNodes: number;

    @DtoAttr()
    public targetLowPriorityNodes: number;
}
