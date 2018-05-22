import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";

import { DropdownModule } from "../dropdown";
import { NotificationModule } from "../notifications";
import { BackgroundTaskTrackerItemComponent } from "./background-task-tracker-item";
import {
    BackgroundTaskTrackerComponent,
} from "./background-task-tracker.component";
import { BackgroundTaskService } from "./background-task.service";

@NgModule({
    declarations: [
        BackgroundTaskTrackerComponent,
        BackgroundTaskTrackerItemComponent,
    ],
    exports: [
        BackgroundTaskTrackerComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        DropdownModule,
        NotificationModule,
    ],
    providers: [
        BackgroundTaskService,
    ],
})
export class BackgroundTaskModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: BackgroundTaskModule,
            providers: [],
        };
    }
}
