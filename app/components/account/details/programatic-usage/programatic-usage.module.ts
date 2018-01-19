import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import {
    AADAppPickerComponent, AADAppSecretPickerComponent,
    AADCredentialsPickerComponent, CreateNewAadAppComponent,
    GenerateAADAppSecretComponent,
    ResourcePermissionButtonComponent,
} from "./aad-credentials-picker";
import { ProgramaticUsageComponent } from "./programatic-usage.component";

const privateComponents = [
    AADCredentialsPickerComponent,
    AADAppPickerComponent,
    GenerateAADAppSecretComponent,
    ResourcePermissionButtonComponent,
    AADAppSecretPickerComponent,
    CreateNewAadAppComponent,
];

const publicComponents = [
    ProgramaticUsageComponent,
];

const modules = [
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
        ProgramaticUsageComponent,
    ],
    imports: modules,
})
export class ProgramaticUsageModule {

}
