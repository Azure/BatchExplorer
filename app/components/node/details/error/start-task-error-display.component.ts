import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { autobind } from "@batch-flask/core";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { FailureInfo, NameValuePair, Pool, StartTaskInfo } from "app/models";
import { FailureInfoDecorator } from "app/models/decorators";
import { NodeService } from "app/services";

@Component({
    selector: "bl-start-task-error-display",
    templateUrl: "start-task-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartTaskErrorDisplayComponent implements OnChanges {
    @Input() public pool: Pool;
    @Input() public nodeId: string;
    @Input() public startTaskInfo: StartTaskInfo;

    public failureInfo: FailureInfo;
    public errorMessage: string;
    public errorCode: string;

    constructor(
        private nodeService: NodeService,
        private sidebarManager: SidebarManager,
        private notificationService: NotificationService) { }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.startTaskInfo) {
            if (this.startTaskInfo) {
                this.failureInfo = this.startTaskInfo.failureInfo;
                this._computeErrorMessage();
            } else {
                this.errorMessage = this.errorCode = "";
                this.failureInfo = null;
            }
        }
    }

    @autobind()
    public editStartTask() {
        const ref = this.sidebarManager.open(`edit-start-task-${this.pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
        ref.component.fromNode = this.nodeId;
    }

    @autobind()
    public rebootNode() {
        return this.nodeService.reboot(this.pool.id, this.nodeId).subscribe(() => {
            this.notificationService.success("Rebooting", `Node is now rebooting`);
        });
    }

    public trackDetail(index, detail: NameValuePair) {
        return detail.name;
    }

    private _computeErrorMessage() {
        if (!this.failureInfo) {
            this.errorMessage = this.errorCode = "";
            return;
        }

        const decorator = new FailureInfoDecorator(this.failureInfo);
        if (decorator.exists) {
            this.errorCode = decorator.code;
            this.errorMessage = decorator.message;
        }
    }
}
