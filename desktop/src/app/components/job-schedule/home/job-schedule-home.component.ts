import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { Filter, FilterBuilder, autobind } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { JobScheduleCreateBasicDialogComponent } from "../action";

@Component({
    standalone: false,
    selector: "bl-job-schedule-home",
    templateUrl: "job-schedule-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleHomeComponent {
    public quickSearchQuery = new UntypedFormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    constructor(formBuilder: UntypedFormBuilder, private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });
    }

    @autobind()
    public addJobSchedule() {
        this.sidebarManager.open("add-job-schedule", JobScheduleCreateBasicDialogComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}
