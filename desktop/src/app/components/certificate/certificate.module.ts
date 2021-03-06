import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { CertificateActionModule } from "./action";
import { CertificateListComponent } from "./browse/certificate-list.component";
import { CertificateAdvancedFilterComponent } from "./browse/filter/certificate-advanced-filter.component";
import { CertificateRoutingModule } from "./certificate-routing.module";
import { CertificateDetailsModule } from "./details/certificate-details.module";
import { CertificateHomeComponent } from "./home/certificate-home.component";

const components = [
    CertificateAdvancedFilterComponent,
    CertificateHomeComponent,
    CertificateListComponent,
];

const modules = [
    CertificateRoutingModule, CertificateActionModule, CertificateDetailsModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class CertificateModule {
}
