import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { autobind, isNotNullOrUndefined } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { List } from "immutable";
import { BehaviorSubject, Subject, Subscription } from "rxjs";

import { Application, ApplicationAction } from "app/models";
import { NcjTemplateService } from "app/services";
import { distinctUntilChanged, filter, startWith, switchMap, takeUntil } from "rxjs/operators";
import "./choose-action.scss";

@Component({
    selector: "bl-choose-action",
    templateUrl: "choose-action.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseActionComponent implements OnChanges, OnDestroy {
    public static breadcrumb() {
        return { name: "Choose Action" };
    }

    @Input() public applicationId: string;

    public application: Application;
    public actions: List<ApplicationAction>;

    private _applicationId = new BehaviorSubject<string | null>(null);
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private electronShell: ElectronShell,
        private templateService: NcjTemplateService) {

        this._applicationId.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            distinctUntilChanged(),
            switchMap((applicationId) => this.templateService.listActions(applicationId)),
        ).subscribe((actions) => {
            this.actions = actions;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.applicationId) {
            this._applicationId.next(this.applicationId);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public trackAction(_, action: ApplicationAction) {
        return action.id;
    }

    public viewOnGithub(action: ApplicationAction) {
        const link = `https://github.com/Azure/BatchExplorer-data/tree/master/ncj/${this.application.id}/${action.id}`;
        this.electronShell.openExternal(link);
    }
}
