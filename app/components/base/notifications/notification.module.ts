import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { NotificationContainerComponent } from "./notification-container.component";
import { NotificationManager } from "./notification-manager";
import { NotificationComponent } from "./notification.component";

const components = [
    NotificationComponent,
    NotificationContainerComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule,
        MaterialModule.forRoot(),
    ],
    providers: [
        NotificationManager,
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
