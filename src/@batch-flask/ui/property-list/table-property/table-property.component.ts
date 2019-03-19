import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild,
    ContentChildren, HostBinding, HostListener, Injector, Input, QueryList, TemplateRef, ViewChild,
} from "@angular/core";
import { ClipboardService } from "@batch-flask/electron";
import { ClickableComponent } from "@batch-flask/ui/buttons";

import "./table-property.scss";

@Component({
    selector: "bl-table-property-header",
    template: `
        <ng-template><ng-content></ng-content></ng-template>
    `,
})
export class TablePropertyHeaderComponent {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @HostBinding("attr.role") public role = "row";
}

@Component({
    selector: "bl-table-property-row",
    template: `
        <ng-template><ng-content></ng-content></ng-template>
    `,
})
export class TablePropertyRowComponent {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @HostBinding("attr.role") public role = "row";

}

let idCounter = 0;
@Component({
    selector: "bl-tp-cell",
    template: `
        <div class="cell-value">
            <ng-container *ngIf="!useContent">{{value}}</ng-container>
            <ng-content *ngIf="useContent"></ng-content>
        </div>
        <div *ngIf="!copyNotificationHidden"
            role="alert"
            class="copied-notification"
            [attr.aria-live]="assertive">
            Copied.
        </div>
        <div [id]="ariaDescribedBy" [hidden]="true" aria-hidden="true">Click to copy</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePropertyCellComponent extends ClickableComponent {
    @Input() public id = `bl-tp-cell-${idCounter++}`;
    @Input() public useContent = false;

    @Input() @HostBinding("attr.title") public value: string;

    @HostBinding("class.property-content-box")
    public box = true;

    @HostBinding("attr.role") public role = "gridcell";
    @HostBinding("attr.aria-describedby") public get ariaDescribedBy() {
        return `${this.id}_describe`;
    }

    public copyNotificationHidden = true;

    constructor(private clipboard: ClipboardService, injector: Injector, private changeDetector: ChangeDetectorRef) {
        super(injector, null);
    }

    public handleAction(event) {
        super.handleAction(event);
        this.changeDetector.markForCheck();
        this.copyNotificationHidden = false;
        if (this.value) {
            this.clipboard.writeText(this.value);
        }
        setTimeout(() => {
            this.copyNotificationHidden = true;
            this.changeDetector.markForCheck();
        }, 1000);
    }

    @HostListener("(focus)")
    public focusContent(event: FocusEvent) {
        window.getSelection().selectAllChildren(event.target as any);
    }
}

@Component({
    selector: "bl-tp-plain-cell",
    template: `
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePropertyCellPlainComponent extends ClickableComponent {
    @Input() public id = `bl-tp-cell-plain-${idCounter++}`;

    @HostBinding("attr.role") public role = "gridcell";
    constructor(injector: Injector) {
        super(injector, null);
    }
}

@Component({
    selector: "bl-table-property",
    templateUrl: "table-property.html",
})
export class TablePropertyComponent {
    public readonly defaultDisplay = 2;

    @Input() public label: string;

    @Input() public expandable = true;

    @ContentChild(TablePropertyHeaderComponent)
    public header: TablePropertyHeaderComponent;

    @ContentChildren(TablePropertyRowComponent)
    public rows: QueryList<TablePropertyRowComponent>;

    @HostBinding("attr.role") public role = "grid";

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

    public trackRow(index, row: TablePropertyRowComponent) {
        return index;
    }
}
