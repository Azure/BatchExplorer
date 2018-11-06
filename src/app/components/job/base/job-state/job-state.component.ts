import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges } from "@angular/core";
import { I18nService } from "@batch-flask/core";
import { Job, JobState, JobTerminateReason } from "app/models";

import "./job-state.scss";

@Component({
    selector: "bl-job-state",
    templateUrl: "job-state.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobStateComponent implements OnChanges {
    public JobState = JobState;
    @Input() public job: Job;

    @HostBinding("class.success") public isSuccess: boolean = false;
    @HostBinding("class.error") public isError = false;

    public errorCode: string;
    public message: string;

    constructor(private i18n: I18nService) { }

    public ngOnChanges(changes) {
        if (changes.job) {
            this.isSuccess = this._getSuccess();
            this.isError = !this.isSuccess && this.job.state === JobState.completed;
            this.message = this._getMessage();
        }
    }

    private _getSuccess() {
        const info = this.job.executionInfo;
        const terminateReason = info && info.terminateReason;
        if (terminateReason) {
            switch (terminateReason) {
                case JobTerminateReason.AllTasksCompleted:
                case JobTerminateReason.UserTerminate:
                case JobTerminateReason.JMComplete:
                    return true;
                case JobTerminateReason.TaskFailed:
                case JobTerminateReason.MaxWallClockTimeExpiry:
                    return false;
                default:
                    return true;
            }
        } else {
            return false;
        }
    }

    private _getMessage() {
        const info = this.job.executionInfo;
        if (info && info.schedulingError) {
            return info.schedulingError.message;
        }

        switch (this.job.state) {
            case JobState.completed:
                return this._getCompletedMessage();
            default:
                return this.i18n.t(`job-state.${this.job.state}.message`);
        }
    }

    private _getCompletedMessage() {
        const info = this.job.executionInfo;
        const terminateReason = info && info.terminateReason;
        if (terminateReason) {
            switch (terminateReason) {
                case JobTerminateReason.AllTasksCompleted:
                    return this.i18n.t(`job-state.completed.allTasksCompleted.message`);
                case JobTerminateReason.UserTerminate:
                    return this.i18n.t(`job-state.completed.userTerminate.message`);
                case JobTerminateReason.JMComplete:
                    return this.i18n.t(`job-state.completed.jmcomplete.message`);
                case JobTerminateReason.TaskFailed:
                    return this.i18n.t(`job-state.completed.taskfailed.message`);
                case JobTerminateReason.MaxWallClockTimeExpiry:
                    return this.i18n.t(`job-state.completed.timeout.message`);
                default:
                    return this.i18n.t(`job-state.completed.message`);
            }
        }
    }
}
