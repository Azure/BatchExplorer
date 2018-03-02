import { Dto, DtoAttr } from "@batch-flask/core";

export class PoolEnableAutoScaleDto extends Dto<PoolEnableAutoScaleDto> {
    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: moment.Duration;
}
