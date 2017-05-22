import { TaskSchedulingPolicy } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class TaskSchedulingPolicyDecorator extends DecoratorBase<TaskSchedulingPolicy> {
    public nodeFillType: string;

    constructor(taskSchedulingPolicy: TaskSchedulingPolicy) {
        super(taskSchedulingPolicy);

        this.nodeFillType = this.stringField(taskSchedulingPolicy.nodeFillType);
    }
}
