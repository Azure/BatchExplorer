import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { ButtonGroupComponent } from "./button-group.component";
import { ButtonComponent } from "./button.component";
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
import { ClickableComponent } from "./clickable";
import { DirectoryPickerComponent } from "./directory-picker.component";
import { RefreshButtonComponent } from "./refresh-btn";

const components = [
    ButtonComponent,
    ButtonGroupComponent,
    AddButtonComponent,
    AddTaskButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DeleteButtonComponent,
    DirectoryPickerComponent,
    DisableButtonComponent,
    DownloadButtonComponent,
    EditButtonComponent,
    EnableButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
    RefreshButtonComponent,
    TerminateButtonComponent,
    ClickableComponent,
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
