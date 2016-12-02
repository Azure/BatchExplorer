import { DecoratorBase } from "../../utils/decorators";
import { TaskSchedulingPolicy } from "../taskSchedulingPolicy";

export class TaskSchedulingPolicyDecorator extends DecoratorBase<TaskSchedulingPolicy> {
    public nodeFillType: string;

    constructor(private taskSchedulingPolicy: TaskSchedulingPolicy) {
        super(taskSchedulingPolicy);

        this.nodeFillType = this.stringField(taskSchedulingPolicy.nodeFillType);
    }
}
