import { ChangeDetectionStrategy, Component, EventEmitter, Output } from "@angular/core";
import { Filter } from "@batch-flask/core";
import { AdvancedFilter, StatePickerControl } from "@batch-flask/ui/advanced-filter";
import { CertificateState } from "app/models";

@Component({
    selector: "bl-certificate-advanced-filter",
    templateUrl: "certificate-advanced-filter.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateAdvancedFilterComponent {
    @Output() public filterChange = new EventEmitter<Filter>();

    public advancedFilter: AdvancedFilter;

    constructor() {
        this.advancedFilter = new AdvancedFilter({
            state: new StatePickerControl("State", [
                CertificateState.active,
                CertificateState.deletefailed,
                CertificateState.deleting,
            ]),
        });

        this.advancedFilter.filterChange.subscribe((filter: Filter) => {
            this.filterChange.emit(filter);
        });
    }
}
