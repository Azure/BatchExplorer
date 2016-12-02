import { ModuleWithProviders, NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { routes } from "../../../app.routes";
import { SubmitButtonComponent } from "./submit-btn.component";

import {
    AddButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    EnableButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
    TerminateButtonComponent,
} from "./buttons.component";

const components = [
    AddButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    EnableButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
    SubmitButtonComponent,
    TerminateButtonComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [...components],
    imports: [BrowserModule, MaterialModule, RouterModule.forRoot(routes, { useHash: true })],
    providers: [],
})

export class ButtonsModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: ButtonsModule,
            providers: [],
        };
    }
}
