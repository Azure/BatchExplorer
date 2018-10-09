import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Application, ApplicationAction } from "app/models";
import { NcjTemplateService } from "app/services";
import "./choose-action.scss";

@Component({
    selector: "bl-choose-action",
    templateUrl: "choose-action.html",
})
export class ChooseActionComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Choose Action" };
    }

    public applicationId: string;
    public application: Application;
    public actions: List<ApplicationAction>;

    private _paramsSubscriber: Subscription;

    constructor(
        private electronShell: ElectronShell,
        private templateService: NcjTemplateService,
        private route: ActivatedRoute) { }

    public ngOnInit() {
        this._paramsSubscriber = this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this._updateActions();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public openReadme() {
        const link = `https://github.com/Azure/BatchExplorer-data/tree/master/ncj/${this.application.id}`;
        this.electronShell.openExternal(link, { activate: true });
    }

    public trackAction(index, action: ApplicationAction) {
        return action.id;
    }

    public viewOnGithub(action: ApplicationAction) {
        const link = `https://github.com/Azure/BatchExplorer-data/tree/master/ncj/${this.application.id}/${action.id}`;
        this.electronShell.openExternal(link);
    }

    private _updateActions() {
        this.templateService.getApplication(this.applicationId).subscribe((application) => {
            this.application = application;
        });
        this.templateService.listActions(this.applicationId).subscribe((actions) => {
            this.actions = actions;
        });
    }
}
