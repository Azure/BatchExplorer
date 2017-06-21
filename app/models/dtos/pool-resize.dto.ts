import { Dto, DtoAttr } from "app/core";

export class PoolResizeDto extends Dto<PoolResizeDto> {
    @DtoAttr()
    public targetDedicatedNodes: number;

    @DtoAttr()
    public targetLowPriorityNodes: number;
}
