import { Component, OnDestroy } from "@angular/core";
import { ElectronRemote } from "@batch-flask/ui";
import { Subscription } from "rxjs";

import { NcjTemplateMode } from "app/models";
import { NcjTemplateService, RecentSubmission } from "app/services";
import "./recent-template-list.scss";

@Component({
    selector: "bl-recent-template-list",
    templateUrl: "recent-template-list.html",
})
export class RecentTemplateListComponent implements OnDestroy {
    public recentSubmissions: RecentSubmission[];

    private _subs: Subscription[] = [];

    constructor(private templateService: NcjTemplateService, private remote: ElectronRemote) {
        this._subs.push(this.templateService.recentSubmission.subscribe((value) => {
            this.recentSubmissions = value;
        }));
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
