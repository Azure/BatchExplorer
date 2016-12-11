import {
    Component, Inject, Input, TemplateRef, ViewChild, forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";

import { SelectableListItemBase } from "../selectable-list/selectable-list-item-base";
import { TableComponent } from "./table.component";

@Component({
    selector: "bex-row",
    templateUrl: `
        <template>
            <tr (click)="handleClick($event)" [class.selected]="active || selected" [class.focused]="isFocused">
                <ng-content></ng-content>
            </tr>
        </template>
    `,
})
export class TableRowComponent extends SelectableListItemBase {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    public get routerLinkActiveClass() {
        return this.routerLink ? "selected" : null;
    }

    // tslint:disable:no-forward-ref
    constructor(@Inject(forwardRef(() => TableComponent)) list: TableComponent, router: Router) {
        super(list, router);
    }
}
