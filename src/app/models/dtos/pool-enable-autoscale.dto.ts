import { Dto, DtoAttr } from "@batch-flask/core";
import * as moment from "moment";

export class PoolEnableAutoScaleDto extends Dto<PoolEnableAutoScaleDto> {
    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: moment.Duration;
}
