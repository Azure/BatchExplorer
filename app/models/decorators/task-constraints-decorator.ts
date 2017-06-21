import { TaskConstraints } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class TaskConstraintsDecorator extends DecoratorBase<TaskConstraints> {
    public maxWallClockTime: string;
    public maxTaskRetryCount: string;
    public retentionTime: string;

    constructor(constraints: TaskConstraints) {
        super(constraints);

        this.maxWallClockTime = this.timespanField(constraints.maxWallClockTime);
        this.maxTaskRetryCount = this.stringField(constraints.maxTaskRetryCount);
        this.retentionTime = this.timespanField(constraints.retentionTime);
    }
}
