import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { DialogService, ElectronShell } from "@batch-flask/ui";
import { MICROSOFT_PORTFOLIO, NcjTemplateService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApplicationSelection } from "../application-list";
import { SubmitMarketApplicationComponent } from "../submit";

import "./gallery.scss";

@Component({
    selector: "bl-gallery",
    templateUrl: "gallery.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Gallery" };
    }

    public query: string = "";
    public quicksearch = new FormControl("");

    public activeApplication: ApplicationSelection | null = null;

    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private electronShell: ElectronShell,
        private dialogService: DialogService,
        private templateService: NcjTemplateService,
        public autoStorageService: AutoStorageService) {

        this.quicksearch.valueChanges.pipe(takeUntil(this._destroy)).subscribe((query) => {
            this.query = query;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.activeRoute.params.pipe(takeUntil(this._destroy)).subscribe((params) => {
            if ("applicationId" in params) {
                this.activeApplication = {
                    applicationId: params["applicationId"],
                    portfolioId: params["portfolioId"] || MICROSOFT_PORTFOLIO.id,
                };
                this.changeDetector.markForCheck();
            }
            if ("actionId" in params) {
                setTimeout(() => {
                    this.submitAction(params["actionId"]);
                });
                this.changeDetector.markForCheck();
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @autobind()
    public refresh() {
        return this.templateService.refresh();
    }

    public selectApplication(application: ApplicationSelection) {
        this.activeApplication = application;
        this.changeDetector.markForCheck();
        if (application) {
            this.router.navigate(["/gallery", application.portfolioId, application.applicationId]);
        } else {
            this.router.navigate(["/gallery"]);
        }
    }

    @autobind()
    public openReadme(applicationId: string) {
        const link = `https://github.com/Azure/BatchExplorer-data/tree/master/ncj/${applicationId}`;
        this.electronShell.openExternal(link, { activate: true });
    }

    public submitAction(actionId: string) {
        const ref = this.dialogService.open(SubmitMarketApplicationComponent);
        ref.componentInstance.configure({
            portfolioId: this.activeApplication.portfolioId,
            applicationId: this.activeApplication.applicationId,
            actionId: actionId,
        });
        ref.afterClosed().pipe(takeUntil(this._destroy)).subscribe(() => {
            this.router.navigate(["/gallery",
                this.activeApplication.portfolioId,
                this.activeApplication.applicationId]);
        });
    }
}
