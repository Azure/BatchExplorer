import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { List } from "immutable";

import { ExitOptions, Job, NameValuePair, Task } from "app/models";
import { TaskDecorator } from "app/models/decorators";
import { JobAction, TaskFailureAction } from "app/models/job-action";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-task-configuration",
    templateUrl: "task-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskConfigurationComponent {
    @Input()
    public job: Job;

    @Input()
    public set task(task: Task) {
        this._task = task;
        this.processExitConditionData();
        this._refresh(task);
    }
    public get task() { return this._task; }

    public decorator: TaskDecorator;
    public appPackages: any[];
    public constraints: any;
    public containerSettings: any;
    public executionInfo: any;
    public exitConditionData: any;
    public environmentSettings: List<NameValuePair> = List([]);
    public nodeInfo: any;

    private _task: Task;

    public get exitConditionWarningMessage() {
        const disabled = this.job.onTaskFailure === TaskFailureAction.noaction;
        // tslint:disable-next-line
        const message = `To enable exit conditions you need to set onTaskFailure on the job to 'performexitoptionsjobaction'`;
        return disabled ? message : "";
    }

    public processExitConditionData() {
        let zeroNoAction = true;
        const noAction = [];
        const terminateJob = [];
        this._task.exitConditions.exitCodes.forEach((mapping) => {
            if (mapping.exitOptions.jobAction === JobAction.none) {
                noAction.push(mapping.code);
            } else {
                terminateJob.push(mapping.code);
                if (mapping.code === 0) {
                    zeroNoAction = false;
                }
            }
        });

        this._task.exitConditions.exitCodeRanges.forEach((mapping) => {
            if (mapping.exitOptions.jobAction === JobAction.none) {
                noAction.push(`${mapping.start} → ${mapping.end}`);
            } else {
                terminateJob.push(`${mapping.start} → ${mapping.end}`);
                if (mapping.start <= 0 && mapping.end >= 0) {
                    zeroNoAction = false;
                }
            }
        });

        terminateJob.push("All others");
        if (zeroNoAction) {
            noAction.unshift(0);
        }

        this.exitConditionData = {
            noAction,
            terminateJob,
            failureInfo: this._jobActionString(this._task.exitConditions.failureInfo),
            default: this._jobActionString(this._task.exitConditions.default),
        };
    }

    private _refresh(task: Task) {
        if (task) {
            this.environmentSettings = task.environmentSettings;

            this.decorator = new TaskDecorator(task);
            this.appPackages = this.decorator.applicationPackageReferences || [];
            this.constraints = this.decorator.constraints || {};
            this.executionInfo = this.decorator.executionInfo || {};
            this.nodeInfo = this.decorator.nodeInfo || {};
            this.containerSettings = this.decorator.containerSettings || {};
        }
    }

    private _jobActionString(exitOptions: ExitOptions) {
        if (!exitOptions) {
            return null;
        }

        switch (exitOptions.jobAction) {
            case JobAction.none:
                return "No Action";
            case JobAction.disable:
                return "Disable Job";
            case JobAction.terminate:
                return "Terminate Job";
            default:
                return exitOptions.jobAction;
        }
    }
}
