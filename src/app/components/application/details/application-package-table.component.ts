import { ChangeDetectionStrategy, Component, Injector, Input, OnChanges, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { BatchApplication, BatchApplicationPackage } from "app/models";
import { BatchApplicationPackageListParams, BatchApplicationPackageService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, of } from "rxjs";
import {
     BatchApplicationPackageCommands,
} from "../action";

@Component({
    selector: "bl-application-package-table",
    templateUrl: "application-package-table.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [BatchApplicationPackageCommands],
})
export class ApplicationPackageTableComponent extends ListBaseComponent implements OnChanges, OnDestroy {
    @Input() public application: BatchApplication;

    public packages: List<BatchApplicationPackage> = List([]);
    public displayedPackages: List<BatchApplicationPackage> = List([]);
    public data: ListView<BatchApplicationPackage, BatchApplicationPackageListParams>;

    constructor(
        public commands: BatchApplicationPackageCommands,
        protected dialog: MatDialog,
        private packagesService: BatchApplicationPackageService,
        injector: Injector) {
        super(injector);

        this.data = this.packagesService.listView();

        this.data.items.subscribe((packages) => {
            this.packages = packages;
            this._filterPackages();
        });
    }

    public ngOnChanges(changes) {
        if (changes.application) {
            if (ComponentUtils.recordChangedId(changes.application)) {
                this.commands.params = { applicationId: this.application.id };
                this.data.params = { applicationId: this.application.id };
                this.data.refresh();
            }
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
    }

    public handleFilter(filter) {
        this._filterPackages();
        return of(this.displayedPackages.size);
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public trackByFn(_: number, pkg: BatchApplicationPackage) {
        return pkg.id;
    }

    private _filterPackages() {
        let text: string = null;
        if (this.filter) {
            text = (this.filter as any).value;
            text = text && text.toLowerCase();
        }

        this.displayedPackages = List<BatchApplicationPackage>(this.packages.filter((app) => {
            return !text || app.name.toLowerCase().indexOf(text) !== -1;
        }));
        this.changeDetector.markForCheck();
    }
}
