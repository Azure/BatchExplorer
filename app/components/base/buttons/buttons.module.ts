import { ModuleWithProviders, NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { SubmitButtonComponent } from "./submit-btn.component";

import { ButtonComponent, ButtonGroupComponent } from "./button.component";
import {
    AddButtonComponent,
    AddTaskButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    DownloadButtonComponent,
    EditButtonComponent,
    EnableButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
    TerminateButtonComponent,
} from "./buttons.component";

const components = [
    ButtonComponent,
    ButtonGroupComponent,
    AddButtonComponent,
    AddTaskButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    DownloadButtonComponent,
    EditButtonComponent,
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
    imports: [BrowserModule, MaterialModule, RouterModule],
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
