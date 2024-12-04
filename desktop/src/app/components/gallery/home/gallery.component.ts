import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { AutoStorageService } from "app/services/storage";
import { Constants } from "common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
        private electronShell: ElectronShell,
        public autoStorageService: AutoStorageService
    ) {

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
