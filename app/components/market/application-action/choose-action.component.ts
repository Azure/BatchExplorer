import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { ApplicationAction } from "app/models";
import { NcjTemplateService } from "app/services";
import "./choose-action.scss";

@Component({
    selector: "bl-choose-action",
    templateUrl: "choose-action.html",
})
export class ChooseActionComponent implements OnInit, OnDestroy {
    public applicationId: string;
    public actions: List<ApplicationAction>;

    private _paramsSubscriber: Subscription;

    constructor(private templateService: NcjTemplateService, private route: ActivatedRoute) { }

    public ngOnInit() {
        this._paramsSubscriber = this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this._updateActions();
        });
    }
    public static breadcrumb() {
        return { name: "Choose Action" };
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    private _updateActions() {
        this.templateService.listActions(this.applicationId).subscribe((actions) => {
            this.actions = actions;
        });
    }
}
