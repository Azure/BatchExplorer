import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { DropdownModule } from "../dropdown";
import { NotificationModule } from "../notifications";
import {
    BackgroundTaskTrackerComponent, BackgroundTaskTrackerItemComponent,
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
