import { Dto, DtoAttr } from "@bl-common/core";

export class PoolResizeDto extends Dto<PoolResizeDto> {
    @DtoAttr()
    public targetDedicatedNodes: number;

    @DtoAttr()
    public targetLowPriorityNodes: number;
}
