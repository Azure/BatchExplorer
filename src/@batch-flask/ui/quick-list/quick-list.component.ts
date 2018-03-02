import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Optional, QueryList,
} from "@angular/core";

import { AbstractListBase } from "../abstract-list";
import { FocusSectionComponent } from "../focus-section";
import { QuickListItemComponent } from "./quick-list-item";

import "./quick-list.scss";

@Component({
    selector: "bl-quick-list",
    templateUrl: "quick-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickListComponent extends AbstractListBase {
    @ContentChildren(QuickListItemComponent)
    public items: QueryList<QuickListItemComponent>;

    constructor(@Optional() focusSection: FocusSectionComponent, changeDetection: ChangeDetectorRef) {
        super(changeDetection, focusSection);
    }
}
