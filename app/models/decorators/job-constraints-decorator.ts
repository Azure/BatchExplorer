import { DecoratorBase } from "../../utils/decorators";
import { JobConstraints } from "../jobConstraints";

export class JobConstraintsDecorator extends DecoratorBase<JobConstraints> {
    public maxWallClockTime: string;
    public maxTaskRetryCount: string;

    constructor(private constraints: JobConstraints) {
        super(constraints);

        this.maxWallClockTime = this.timespanField(constraints.maxWallClockTime);
        this.maxTaskRetryCount = this.stringField(constraints.maxTaskRetryCount);
    }
}
