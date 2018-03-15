import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
// import { SidebarManager } from "@batch-flask/ui/sidebar";
// import { CertificateCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bl-certificate-home",
    templateUrl: "certificate-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    constructor(
        formBuilder: FormBuilder,
        // private sidebarManager: SidebarManager
    ) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            console.log("query", query);
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("thumbprint").startswith(query);
            }

            this._updateFilter();
        });
    }

    @autobind()
    public addCertificate() {
        // this.sidebarManager.open("add-certificate", CertificateCreateBasicDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
