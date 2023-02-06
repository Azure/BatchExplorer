import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import {
    AADAppPickerComponent, AADAppSecretPickerComponent,
    AADCredentialsPickerComponent, CreateNewAadAppComponent,
    GenerateAADAppSecretComponent,
    ResourcePermissionButtonComponent,
} from "./aad-credentials-picker";
import { ProgrammaticUsageComponent } from "./programmatic-usage.component";
import { ProgrammingSampleComponent } from "./programming-sample";

const privateComponents = [
    AADCredentialsPickerComponent,
    AADAppPickerComponent,
    GenerateAADAppSecretComponent,
    ResourcePermissionButtonComponent,
    AADAppSecretPickerComponent,
    CreateNewAadAppComponent,
    ProgrammingSampleComponent,
];

const publicComponents = [
    ProgrammaticUsageComponent,
];

const modules = [
    CommonModule,
    ...commonModules,
];

@NgModule({
    declarations: [
        ...privateComponents,
        ...publicComponents,
    ],
    exports: [
        ...publicComponents,
    ],
    entryComponents: [
        ProgrammaticUsageComponent,
    ],
    imports: modules,
})
export class ProgrammaticUsageModule {

}
