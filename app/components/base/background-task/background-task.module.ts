import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { DropdownModule } from "../dropdown";
import { BackgroundTaskManager } from "./background-task-manager";
import {
    BackgroundTaskTrackerComponent, BackgroundTaskTrackerItemComponent,
} from "./background-task-tracker.component";

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
        MaterialModule.forRoot(),
        DropdownModule.forRoot(),
    ],
    providers: [
        BackgroundTaskManager,
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
