import {
    Component, ContentChild, ContentChildren, HostBinding, HostListener, Input, QueryList, TemplateRef, ViewChild,
} from "@angular/core";
import { clipboard } from "electron";

@Component({
    selector: "bl-table-property-header",
    template: `
        <template><ng-content></ng-content></template>
    `,
})
export class TablePropertyHeaderComponent {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

@Component({
    selector: "bl-table-property-row",
    template: `
        <template><ng-content></ng-content></template>
    `,
})
export class TablePropertyRowComponent {
    @Input()
    public label: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

}

@Component({
    selector: "bl-tp-cell",
    template: `
        <div class="cell-value">{{value}}</div>
        <div class="copied-notification" [class.hidden]="copyNotificationHidden">Copied.</div>
    `,
})
export class TablePropertyCellComponent {
    @Input()
    @HostBinding("attr.title")
    public value;

    public copyNotificationHidden = true;

    @HostListener("click")
    public onClick() {
        this.copyNotificationHidden = false;
        clipboard.writeText(this.value);
        setTimeout(() => {
            this.copyNotificationHidden = true;
        }, 1000);
    }
}

@Component({
    selector: "bl-table-property",
    templateUrl: "table-property.html",
})
export class TablePropertyComponent {
    public readonly defaultDisplay = 2;

    @Input()
    public label: string;

    @Input()
    public expandable = true;

    @ContentChild(TablePropertyHeaderComponent)
    public header: TablePropertyHeaderComponent;

    @ContentChildren(TablePropertyRowComponent)
    public rows: QueryList<TablePropertyRowComponent>;

    public expanded = false;

    public get displayRows(): TablePropertyRowComponent[] {
        if (!this.expandable || this.expanded) {
            return this.rows.toArray();
        } else {
            const out = [];
            this.rows.some((x, i) => {
                if (i >= this.defaultDisplay) {
                    return true;
                }
                out.push(x);
                return false;
            });
            return out;
        }
    }

    public get canExpand() {
        return this.expandable && !this.expanded && this.rows.length > this.defaultDisplay;
    }

    public get canCollapse() {
        return this.expandable && this.expanded && this.rows.length > this.defaultDisplay;
    }

    public expand() {
        this.expanded = true;
    }
}
