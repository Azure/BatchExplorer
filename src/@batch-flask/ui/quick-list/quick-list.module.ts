import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { AbstractListModule } from "@batch-flask/ui/abstract-list";
import { LoadingModule } from "@batch-flask/ui/loading";
import { VirtualScrollModule } from "@batch-flask/ui/virtual-scroll";
import { ContextMenuModule } from "../context-menu";
import { NoItemComponent } from "./no-item.component";
import { QuickListItemStatusComponent } from "./quick-list-item-status";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "./quick-list-row-def";
import { QuickListRowRenderComponent } from "./quick-list-row-render";
import { QuickListComponent } from "./quick-list.component";

const publicComponents = [
    NoItemComponent,
    QuickListComponent,
    QuickListItemStatusComponent,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
    QuickListRowStateDirective,
    QuickListRowExtraDirective,
    QuickListRowRenderComponent,
];

@NgModule({
    declarations: publicComponents,
    exports: publicComponents,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MaterialModule,
        ContextMenuModule,
        VirtualScrollModule,
        LoadingModule,
        AbstractListModule,
    ],
})
export class QuickListModule {
}
