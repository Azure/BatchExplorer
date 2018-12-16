import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { NotificationModule } from "@batch-flask/ui/notifications";
import { ToolbarModule } from "@batch-flask/ui/toolbar";
import { VirtualScrollModule } from "@batch-flask/ui/virtual-scroll";
import {
    ActivityMonitorComponent,
    ActivityMonitorItemActionComponent,
    ActivityMonitorItemComponent,
    ActivityMonitorTreeViewComponent,
} from "./activity-monitor";
import { ActivityMonitorFooterComponent } from "./activity-monitor-footer";
import { ActivityMonitorFooterItemComponent } from "./activity-monitor-footer-item";

@NgModule({
    imports: [
        CommonModule,
        ButtonsModule,
        FocusSectionModule,
        FormsModule,
        MaterialModule,
        DropdownModule,
        NotificationModule,
        VirtualScrollModule,
        ToolbarModule,
    ],
    declarations: [
        ActivityMonitorFooterComponent,
        ActivityMonitorFooterItemComponent,
        ActivityMonitorComponent,
        ActivityMonitorTreeViewComponent,
        ActivityMonitorItemComponent,
        ActivityMonitorItemActionComponent,
    ],
    exports: [
        ActivityMonitorFooterComponent,
        ActivityMonitorComponent,
    ],
})
export class ActivityModule {
}
