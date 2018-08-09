import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { NotificationModule } from "@batch-flask/ui/notifications";
import { ActivityMonitorFooterComponent } from "./activity-monitor-footer";
import { ActivityMonitorFooterItemComponent } from "./activity-monitor-footer-item";
import { ActivityService } from "./activity.service";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        DropdownModule,
        NotificationModule,
    ],
    declarations: [
        ActivityMonitorFooterComponent,
        ActivityMonitorFooterItemComponent,
    ],
    exports: [
        ActivityMonitorFooterComponent,
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
