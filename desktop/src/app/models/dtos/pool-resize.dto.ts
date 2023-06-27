import { Dto, DtoAttr } from "@batch-flask/core";
import { Duration } from "luxon";

export enum NodeDeallocationOption {
    requeue = "requeue",
    terminate = "terminate",
    taskcompletion = "taskcompletion",
    retaineddata = "retaineddata",
}

export class PoolResizeDto extends Dto<PoolResizeDto> {
    @DtoAttr()
    public nodeDeallocationOption: NodeDeallocationOption;

    @DtoAttr()
    public resizeTimeout?: Duration;

    @DtoAttr()
    public targetDedicatedNodes: number;

    @DtoAttr()
    public targetLowPriorityNodes: number;
}
