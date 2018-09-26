import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { NotificationModule } from "@batch-flask/ui/notifications";
import { VirtualScrollModule } from "@batch-flask/ui/virtual-scroll";
import {
    ActivityMonitorComponent,
    ActivityMonitorItemActionComponent,
    ActivityMonitorItemComponent,
    ActivityMonitorTreeViewComponent,
} from "./activity-monitor";
import { ActivityMonitorFooterComponent } from "./activity-monitor-footer";
import { ActivityMonitorFooterItemComponent } from "./activity-monitor-footer-item";
import { ActivityService } from "./activity.service";

@NgModule({
    imports: [
        BrowserModule,
        ButtonsModule,
        FocusSectionModule,
        FormsModule,
        MaterialModule,
        DropdownModule,
        NotificationModule,
        VirtualScrollModule,
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
    providers: [
        ActivityService,
    ],
})
export class ActivityModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: ActivityModule,
            providers: [],
        };
    }
}
