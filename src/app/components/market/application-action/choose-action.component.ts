import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { ApplicationAction } from "app/models";
import { NcjTemplateService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject, Subject } from "rxjs";
import { distinctUntilChanged, filter, switchMap, takeUntil } from "rxjs/operators";
import { ApplicationSelection } from "../application-list";
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

    @Input() public application: ApplicationSelection;
    @Output() public actionChange = new EventEmitter<string>();

    public actions: List<ApplicationAction>;

    private _application = new BehaviorSubject<ApplicationSelection | null>(null);
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private electronShell: ElectronShell,
        private templateService: NcjTemplateService) {

        this._application.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            distinctUntilChanged(),
            switchMap(({portfolioId, applicationId}) => this.templateService.listActions(portfolioId, applicationId)),
        ).subscribe((actions) => {
            this.actions = actions;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.application) {
            console.log("THis", this.application);
            this._application.next(this.application);
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
        // TODO-TIM
        // const link = `https://github.com/Azure/BatchExplorer-data/tree/master/ncj/${this.applicationId}/${action.id}`;
        // this.electronShell.openExternal(link);
    }

    public selectAction(action: ApplicationAction) {
        this.actionChange.emit(action.id);
    }
}
