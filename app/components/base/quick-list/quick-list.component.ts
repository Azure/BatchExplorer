import {
    ChangeDetectorRef, Component, ContentChildren, Input, Optional, QueryList,
} from "@angular/core";

import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListItemComponent } from "./quick-list-item";

import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
})
export class QuickListComponent extends AbstractListBase {
    @ContentChildren(QuickListItemComponent)
    public items: QueryList<QuickListItemComponent>;

    public viewPortItems = [];
    constructor(@Optional() focusSection: FocusSectionComponent, changeDetection: ChangeDetectorRef) {
        super(changeDetection, focusSection);
    }

    public updateViewPortItems(items) {
        this.viewPortItems = items;
        this.changeDetector.markForCheck();
    }
}
