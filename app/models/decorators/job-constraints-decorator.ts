import { JobConstraints } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class JobConstraintsDecorator extends DecoratorBase<JobConstraints> {
    public maxWallClockTime: string;
    public maxTaskRetryCount: string;

    constructor(constraints: JobConstraints) {
        super(constraints);

        this.maxWallClockTime = this.timespanField(constraints.maxWallClockTime);
        this.maxTaskRetryCount = this.stringField(constraints.maxTaskRetryCount);
    }
}
