import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserConfigurationService, autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui";
import { AutoStorageService } from "app/services/storage";
import { BEUserDesktopConfiguration, Constants } from "common";
import { Subject } from "rxjs";
import { map, publishReplay, refCount, takeUntil } from "rxjs/operators";
import { formatDateTime } from "@azure/bonito-core/lib/datetime";

import "./gallery.scss";
import { DateTime } from "luxon";

@Component({
    selector: "bl-gallery",
    templateUrl: "gallery.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent implements OnDestroy {
    public static breadcrumb() {
        return { name: "Gallery" };
    }

    public query: string = "";
    public quicksearch = new FormControl("");

    private _baseUrl: string;
    private _destroy = new Subject();

    public deprecateRenderingDate = formatDateTime(new Date(Date.parse("29 Feb 2024")), DateTime.DATE_SHORT)

    constructor(
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private electronShell: ElectronShell,
        private dialogService: DialogService,
        public autoStorageService: AutoStorageService,
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

        this.quicksearch.valueChanges.pipe(takeUntil(this._destroy)).subscribe((query) => {
            this.query = query;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @autobind()
    public refresh() {
        // no op
    }

    @autobind()
    public openReadme(applicationId: string) {
        const link = `${this._baseUrl}/${applicationId}/readme.md`;
        this.electronShell.openExternal(link, { activate: true });
    }

    private _getRepoUrl(repo: string, branch: string, path: string) {
        return `${Constants.ServiceUrl.github}/${repo}/tree/${branch}/${path}`;
    }

    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
    }
}
