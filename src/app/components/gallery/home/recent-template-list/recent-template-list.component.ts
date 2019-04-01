import { Component, HostListener, OnDestroy } from "@angular/core";
import { ElectronRemote } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui";
import { NcjTemplateMode } from "app/models";
import { NcjTemplateService, RecentSubmission } from "app/services";
import { Subscription } from "rxjs";
import { SubmitRecentTemplateComponent } from "../../submit-recent-template";

import "./recent-template-list.scss";

@Component({
    selector: "bl-recent-template-list",
    templateUrl: "recent-template-list.html",
})
export class RecentTemplateListComponent implements OnDestroy {
    public recentSubmissions: RecentSubmission[];

    private _subs: Subscription[] = [];

    constructor(
        private templateService: NcjTemplateService,
        private remote: ElectronRemote,
        private dialogService: DialogService) {
        this._subs.push(this.templateService.recentSubmission.subscribe((value) => {
            this.recentSubmissions = value;
            this.onResizeEvent(null);
        }));
    }

    @HostListener("window:resize", ["$event"])
    public onResizeEvent(event) {
        // adjust displayed tempalte name based on window width to keep it in one row
        const charcount = window.innerWidth / 4 / 5;
        this.recentSubmissions.forEach(submission => {
            if (submission.name.length - charcount > 0) {
                submission.displayName = "Run template ..." +
                    submission.name.replace("Run template ", "").
                    substr(submission.name.length - charcount + 1, charcount);
            } else {
                submission.displayName = submission.name;
            }
        });
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this._subs = [];
    }

    public createParameterFile(recent: RecentSubmission) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Save",
            defaultPath: this._getParameterFileName(recent.mode),
        });

        if (localPath) {
            this.templateService.createParameterFileFromSubmission(localPath, recent);
        }
    }

    public formatMode(mode: NcjTemplateMode) {
        switch (mode) {
            case NcjTemplateMode.NewPool:
                return "Pool for later use";
            case NcjTemplateMode.ExistingPoolAndJob:
                return "Job with existing pool";
            case NcjTemplateMode.NewPoolAndJob:
                return "Job with auto-pool";
        }
    }

    public trackTemplate(index, recent: RecentSubmission) {
        return recent.id;
    }

    public run(recent: RecentSubmission) {
        const ref = this.dialogService.open(SubmitRecentTemplateComponent);
        ref.componentInstance.recentTemplateId = recent.id;
    }

    private _getParameterFileName(mode: NcjTemplateMode) {
        switch (mode) {
            case NcjTemplateMode.NewPool:
                return "pool.parameters.json";
            case NcjTemplateMode.ExistingPoolAndJob:
            case NcjTemplateMode.NewPoolAndJob:
                return "job.parameters.json";
        }
    }
}
