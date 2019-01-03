import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { AppPackagePickerComponent } from "./app-packages/app-package-picker.component";
import {
    CertificatePickerComponent, CertificateReferencesPickerComponent, TrimThumbprintPipe,
} from "./certificate-references";
import { PoolNodesPreviewComponent } from "./pool-nodes-preview.component";
import { PoolOsIconComponent } from "./pool-os-icon";

const privateComponents = [
    TrimThumbprintPipe,
];
const publicComponents = [
    AppPackagePickerComponent,
    PoolNodesPreviewComponent,
    PoolOsIconComponent,
    CertificatePickerComponent,
    CertificateReferencesPickerComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [
        CommonModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule,
    ],
})
export class PoolBaseModule {
}
