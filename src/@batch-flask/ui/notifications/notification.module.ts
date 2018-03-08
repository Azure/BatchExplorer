import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DropdownModule } from "../dropdown";
import { NotificationContainerComponent } from "./notification-container.component";
import { NotificationService } from "./notification-service";
import { NotificationComponent } from "./notification.component";
import { PersistedNotificationDropdownComponent } from "./persisted-dropdown";

const components = [
    NotificationComponent,
    NotificationContainerComponent,
    PersistedNotificationDropdownComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule,
        MaterialModule,
        DropdownModule,
        ButtonsModule,
    ],
    providers: [
        NotificationService,
    ],
})
export class NotificationModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: NotificationModule,
            providers: [],
        };
    }
}
