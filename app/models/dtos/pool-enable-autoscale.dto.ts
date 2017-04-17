import { Dto, DtoAttr } from "app/core";

export class PoolEnableAutoScaleDto extends Dto<PoolEnableAutoScaleDto> {
    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: moment.Duration;
}
