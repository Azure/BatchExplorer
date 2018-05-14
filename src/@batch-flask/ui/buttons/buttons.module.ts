import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { ButtonGroupComponent } from "./button-group.component";
import { ButtonComponent } from "./button.component";
import {
    AddButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DownloadButtonComponent,
    EditButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
} from "./buttons.component";
import { ClickableComponent } from "./clickable";
import { DirectoryPickerComponent } from "./directory-picker.component";
import { RefreshButtonComponent } from "./refresh-btn";

const components = [
    ButtonComponent,
    ButtonGroupComponent,
    AddButtonComponent,
    ClearListSelectionButtonComponent,
    CloneButtonComponent,
    DirectoryPickerComponent,
    DownloadButtonComponent,
    EditButtonComponent,
    LoadingButtonComponent,
    ResizeButtonComponent,
    RefreshButtonComponent,
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
