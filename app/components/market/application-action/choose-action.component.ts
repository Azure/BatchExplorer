import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Application, ApplicationAction } from "app/models";
import { ElectronShell, NcjTemplateService } from "app/services";
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
    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
    }

    private _updateActions() {
        this.templateService.getApplication(this.applicationId).subscribe((application) => {
            this.application = application;
            console.log("application: ", application);
        });
        this.templateService.listActions(this.applicationId).subscribe((actions) => {
            this.actions = actions;
        });
    }
}
