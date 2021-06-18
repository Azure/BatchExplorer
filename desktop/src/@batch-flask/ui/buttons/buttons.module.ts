import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { ButtonGroupComponent } from "./button-group.component";
import { ButtonComponent } from "./button.component";
import {
    ClearListSelectionButtonComponent,
    DownloadButtonComponent,
    LoadingButtonComponent,
} from "./buttons.component";
import { ClickableComponent } from "./clickable";
import { DirectoryPickerComponent } from "./directory-picker.component";
import { RefreshButtonComponent } from "./refresh-btn";

const components = [
    ButtonComponent,
    ButtonGroupComponent,
    ClearListSelectionButtonComponent,
    DirectoryPickerComponent,
    DownloadButtonComponent,
    LoadingButtonComponent,
    RefreshButtonComponent,
    ClickableComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [...components],
    imports: [CommonModule, MaterialModule, RouterModule],
})

export class ButtonsModule {
}
