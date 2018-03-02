import { Dto, DtoAttr } from "@batch-flask/core";

export class PoolResizeDto extends Dto<PoolResizeDto> {
    @DtoAttr()
    public targetDedicatedNodes: number;

    @DtoAttr()
    public targetLowPriorityNodes: number;
}
