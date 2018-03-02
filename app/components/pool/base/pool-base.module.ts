import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { BaseModule } from "@bl-common/ui";
import { AppPackagePickerComponent } from "./app-packages/app-package-picker.component";
import { PoolNodesPreviewComponent } from "./pool-nodes-preview.component";

const components = [AppPackagePickerComponent, PoolNodesPreviewComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule,
    ],
})
export class PoolBaseModule {
}
