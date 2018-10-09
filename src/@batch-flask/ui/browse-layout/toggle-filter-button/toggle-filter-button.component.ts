import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from "@angular/core";

import { Filter, FilterBuilder } from "@batch-flask/core";
import "./toggle-filter-button.scss";

@Component({
    selector: "bl-toggle-filter-button",
    templateUrl: "toggle-filter-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleFilterButtonComponent implements OnChanges {
    @Input() public advancedFilter: Filter = FilterBuilder.none();
    @Output() public do = new EventEmitter();

    public hasAdvancedFilter: boolean;
    public title: string;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.advancedFilter) {
            if (this.advancedFilter) {
                this.hasAdvancedFilter = !this.advancedFilter.isEmpty();
            }
            this._updateTitle();
        }
    }
    public toggle() {
        this.do.emit();
    }

    private _updateTitle() {
        const msg = "Toggle advanced filter";
        if (this.hasAdvancedFilter) {
            this.title = `${msg} ${this.advancedFilter.toOData()}`;
        } else {
            this.title = msg;
        }
    }
}
