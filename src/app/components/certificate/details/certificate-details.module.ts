import { NgModule } from "@angular/core";

import { BaseModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { CertificateConfigurationComponent } from "./certificate-configuration.component";
import { CertificateDefaultComponent } from "./certificate-default.component";
import { CertificateDetailsComponent } from "./certificate-details.component";

const components = [
    CertificateDetailsComponent,
    CertificateDefaultComponent,
    CertificateConfigurationComponent,
];

const modules = [
    BaseModule,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        ...commonModules,
        ...modules,
    ],
})
export class CertificateDetailsModule {
}
