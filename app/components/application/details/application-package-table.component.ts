import { ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { MatDialog } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { ListBaseComponent } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationPackage, BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import { DateUtils } from "app/utils";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent, DeletePackageAction } from "../action";

@Component({
    selector: "bl-application-package-table",
    templateUrl: "application-package-table.html",
})
export class ApplicationPackageTableComponent extends ListBaseComponent implements OnChanges {
    @Input() public application: BatchApplication;

    public packages: List<ApplicationPackage> = List([]);
    public displayedPackages: List<ApplicationPackage> = List([]);

    constructor(
        protected dialog: MatDialog,
        private applicationService: ApplicationService,
        private sidebarManager: SidebarManager,
        changeDetector: ChangeDetectorRef,
        private taskManager: BackgroundTaskService) {
        super(changeDetector);
    }

    public ngOnChanges(inputs) {
        if (inputs.application) {
            if (!this.packages.equals(this.application.packages)) {
                this._updatePackages();
            }
        }
    }

    public handleFilter(filter) {
        this._filterPackages();
    }

    public formatDate(date: Date) {
        return DateUtils.fullDateAndTime(date);
    }

    public addPackage(event: any) {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public deleteSelection() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeletePackageAction(this.applicationService, this.application.id,
                [...this.selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        }).subscribe((done) => {
            if (done) {
                this.refresh();
            }
        });
    }

    public refresh(): Observable<any> {
        return this.applicationService.get(this.application.id);
    }

    @autobind()
    public activateActiveItem() {
        const dialogRef = this.dialog.open(ActivatePackageDialogComponent);
        dialogRef.componentInstance.applicationId = this.application.id;
        dialogRef.componentInstance.packageVersion = this.activeItem;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    @autobind()
    public updatePackageVersion() {
        const sidebarRef = this.sidebarManager.open("update-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application, this.activeItem);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    public trackByFn(index, pkg: ApplicationPackage) {
        return pkg.version;
    }

    private _updatePackages() {
        if (this.application) {
            this.packages = this.application.packages;
        } else {
            this.packages = List([]);
        }
        this._filterPackages();
    }

    private _filterPackages() {
        let text: string = null;
        if (this.filter) {
            text = (this.filter as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedPackages = List<ApplicationPackage>(this.packages.filter((app) => {
            return !text || app.version.toLowerCase().indexOf(text) !== -1;
        }));
    }
}
