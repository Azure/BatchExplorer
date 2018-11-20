import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DropdownModule } from "../dropdown";
import { NotificationService } from "./notification-service";
import { PersistedNotificationDropdownComponent } from "./persisted-dropdown";
import { ToastComponent } from "./toast";
import { ToastsContainerComponent } from "./toasts-container";

const privateComponents = [
    ToastComponent,
];
const publicComponents = [
    ToastsContainerComponent,
    PersistedNotificationDropdownComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [
        CommonModule,
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
