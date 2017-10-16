import { Component, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Modes } from "app/components/market/submit";
import { NcjTemplateService, RecentSubmission } from "app/services";
import "./recent-template-list.scss";

@Component({
    selector: "bl-recent-template-list",
    templateUrl: "recent-template-list.html",
})
export class RecentTemplateListComponent implements OnDestroy {
    public recentSubmissions: RecentSubmission[];

    private _subs: Subscription[] = [];

    constructor(private templateService: NcjTemplateService) {
        this._subs.push(this.templateService.recentSubmission.subscribe((value) => {
            this.recentSubmissions = value;
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
        this._subs = [];
    }

    public formatMode(mode: Modes) {
        switch (mode) {
            case Modes.NewPool:
                return "Pool";
            case Modes.ExistingPoolAndJob:
                return "Job";
            case Modes.NewPoolAndJob:
                return "Job with auto pool";
        }
    }
}
