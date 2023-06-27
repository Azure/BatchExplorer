import { Job, JobState } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { JobConstraintsDecorator } from "./job-constraints-decorator";
import { JobExecutionInfoDecorator } from "./job-execution-info-decorator";
import { JobManagerTaskDecorator } from "./job-manager-task-decorator";
import { JobPreparationTaskDecorator } from "./job-preparation-task-decorator";
import { JobReleaseTaskDecorator } from "./job-release-task-decorator";

export class JobDecorator extends DecoratorBase<Job> {
    public state: string;
    public stateIcon: string;
    public displayName: string;
    public creationTime: string;
    public lastModified: string;
    public previousState: string;
    public previousStateTransitionTime: string;
    public priority: string;
    public usesTaskDependencies: boolean;
    public onAllTasksComplete: string;
    public onTaskFailure: string;

    public constraints: JobConstraintsDecorator;
    public executionInfo: JobExecutionInfoDecorator;
    public jobManagerTask: JobManagerTaskDecorator;
    public jobPreparationTask: JobPreparationTaskDecorator;
    public jobReleaseTask: JobReleaseTaskDecorator;
    public poolInfo: {};

    constructor(job: Job) {
        super(job);

        this.state = this.stateField(job.state);
        this.stateIcon = this._getStateIcon(job.state);
        this.displayName = this.stringField(job.displayName);
        this.previousState = this.stateField(job.previousState);
        this.priority = this.numberField(job.priority);
        this.usesTaskDependencies = job.usesTaskDependencies;
        this.onAllTasksComplete = this._translateAutoComplete(job.onAllTasksComplete);
        this.onTaskFailure = this._translateAutoComplete(job.onTaskFailure);

        this.constraints = new JobConstraintsDecorator(job.constraints || {} as any);
        this.executionInfo = new JobExecutionInfoDecorator(job.executionInfo || {} as any);
        this.jobManagerTask = new JobManagerTaskDecorator(job.jobManagerTask || {} as any);
        this.jobPreparationTask = new JobPreparationTaskDecorator(job.jobPreparationTask || {} as any);
        this.jobReleaseTask = new JobReleaseTaskDecorator(job.jobReleaseTask || {} as any);
        this.poolInfo = job.poolInfo || {};
    }

    private _getStateIcon(state: JobState): string {
        switch (state) {
            case JobState.active:
                return "fa-cog";
            case JobState.completed:
                return "fa-check-circle-o";
            case JobState.deleting:
            case JobState.disabling:
            case JobState.disabled:
            case JobState.terminating:
                return "fa-ban";

            default:
                return "fa-question-circle-o";
        }
    }

    // todo: can be moved into a common method when we localize
    private _translateAutoComplete(state: string): string {
        switch (state) {
            case "noaction":
                return "NoAction";
            case "performexitoptionsjobaction":
                return "PerformExitOptionsJobAction";
            case "terminatejob":
                return "TerminateJob";

            default:
                return state;
        }
    }
}
