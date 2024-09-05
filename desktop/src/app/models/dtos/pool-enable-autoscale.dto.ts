import { Dto, DtoAttr } from "@batch-flask/core/dto";
import { Duration } from "luxon";

export class PoolEnableAutoScaleDto extends Dto<PoolEnableAutoScaleDto> {
    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: Duration;
}
