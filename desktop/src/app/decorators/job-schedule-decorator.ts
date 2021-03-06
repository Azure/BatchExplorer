import { JobSchedule, JobScheduleState } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { JobScheduleExecutionInfoDecorator } from "./job-schedule-execution-info-decorator";
import { JobScheduleScheduleDecorator } from "./job-schedule-schedule-decorator";

export class JobScheduleDecorator extends DecoratorBase<JobSchedule> {
    public state: string;
    public stateTransitionTime: string;
    public stateIcon: string;
    public displayName: string;
    public creationTime: string;
    public lastModified: string;
    public previousState: string;
    public previousStateTransitionTime: string;

    public executionInfo: JobScheduleExecutionInfoDecorator;
    public schedule: JobScheduleScheduleDecorator;

    constructor(jobSchedule: JobSchedule) {
        super(jobSchedule);

        this.state = this.stateField(jobSchedule.state);
        this.stateIcon = this._getStateIcon(jobSchedule.state);
        this.displayName = this.stringField(jobSchedule.displayName);
        this.previousState = this.stateField(jobSchedule.previousState);

        this.executionInfo = new JobScheduleExecutionInfoDecorator(jobSchedule.executionInfo || {} as any);
        this.schedule = new JobScheduleScheduleDecorator(jobSchedule.schedule || {} as any);
    }

    private _getStateIcon(state: JobScheduleState): string {
        switch (state) {
            case JobScheduleState.active:
                return "fa-cog";
            case JobScheduleState.completed:
                return "fa-check-circle-o";
            case JobScheduleState.deleting:
            case JobScheduleState.disabled:
            case JobScheduleState.terminating:
                return "fa-ban";
            default:
                return "fa-question-circle-o";
        }
    }
}
