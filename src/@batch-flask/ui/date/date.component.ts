import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { DateUtils } from "@batch-flask/utils";

@Component({
    selector: "bl-date",
    template: "{{formatedDate}}",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateComponent implements OnChanges {
    @Input() public date: Date;

    public formatedDate: string;

    public ngOnChanges(changes) {
        if (changes.date) {
            this.formatedDate = DateUtils.prettyDate(this.date);
        }
    }
}
