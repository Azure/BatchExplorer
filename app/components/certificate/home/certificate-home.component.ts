import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { CertificateCreateDialogComponent } from "../action/add";

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

    public keyField = "thumbprint";
    public config = {
        quickSearchField: "thumbprint",
        keyField: "thumbprint",
    };

    constructor(formBuilder: FormBuilder, private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
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
        this.sidebarManager.open("add-certificate", CertificateCreateDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
