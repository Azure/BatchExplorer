import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { UserConfigurationService, isNotNullOrUndefined } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { ApplicationAction } from "app/models";
import { MICROSOFT_PORTFOLIO, NcjTemplateService } from "app/services";
import { BEUserDesktopConfiguration, Constants } from "common";
import { List } from "immutable";
import { BehaviorSubject, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap, takeUntil } from "rxjs/operators";
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
    private _baseUrl: string;

    private _application = new BehaviorSubject<ApplicationSelection | null>(null);
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private electronShell: ElectronShell,
        private templateService: NcjTemplateService,
        private settingsService: UserConfigurationService<BEUserDesktopConfiguration>) {
        this.settingsService.watch("microsoftPortfolio").pipe(
            takeUntil(this._destroy),
            map((settings) => {
                const branch = settings.branch;
                const repo = settings.repo;
                const path = settings.path;
                return {
                    branch: branch || "master",
                    repo: repo || "Azure/batch-extension-templates",
                    path: path || "templates",
                };
            }),
            map(({repo, branch, path}) => {
                return this._getRepoUrl(repo, branch, path);
            }),
            publishReplay(1),
            refCount(),
        ).subscribe(url => this._baseUrl = url);

        this._application.pipe(
            takeUntil(this._destroy),
            filter(isNotNullOrUndefined),
            distinctUntilChanged(),
            switchMap(({ portfolioId, applicationId }) => this.templateService.listActions(portfolioId, applicationId)),
        ).subscribe((actions) => {
            this.actions = actions;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.application) {
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
        if (this.isMicrosoftOfficial) {
            const { applicationId } = this.application;
            const link = `${this._baseUrl}/${applicationId}/${action.id}`;
            this.electronShell.openExternal(link);
        }
    }

    public selectAction(action: ApplicationAction) {
        this.actionChange.emit(action.id);
    }

    public get isMicrosoftOfficial() {
        return this.application.portfolioId === MICROSOFT_PORTFOLIO.id;
    }

    private _getRepoUrl(repo: string, branch: string, path: string) {
        return `${Constants.ServiceUrl.github}/${repo}/tree/${branch}/${path}`;
    }
}
