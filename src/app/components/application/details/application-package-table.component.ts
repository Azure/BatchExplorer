import { Component, Injector, Input, OnChanges } from "@angular/core";
import { MatDialog } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationPackage, BatchApplication } from "app/models";
import { BatchApplicationService } from "app/services";
import { List } from "immutable";
import { Observable, forkJoin, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { ActivatePackageDialogComponent, ApplicationCreateDialogComponent } from "../action";

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
        private applicationService: BatchApplicationService,
        private sidebarManager: SidebarManager,
        injector: Injector) {
        super(injector);
    }

    public ngOnChanges(inputs) {
        // if (inputs.application) {
        //     if (!this.packages.equals(this.application.packages)) {
        //         this._updatePackages();
        //     }
        // }
    }

    public handleFilter(filter) {
        this._filterPackages();
        return of(this.displayedPackages.size);
    }

    public addPackage(event: any) {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public deleteSelection(): Observable<any[]> {
        const observables = Array.from(this.selection.keys).map((version) => {
            return this.applicationService.deletePackage(this.application.id, version).pipe(
                flatMap(() => this.refresh()),
            );
        });

        return forkJoin(observables);
    }

    @autobind()
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

    // TODO-TIM
    // private _updatePackages() {
    // if (this.application) {
    //     this.packages = this.application.packages;
    // } else {
    //     this.packages = List([]);
    // }
    // this._filterPackages();
    // }

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
