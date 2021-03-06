import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CertificateDefaultComponent, CertificateDetailsComponent } from "./details";
import { CertificateHomeComponent } from "./home/certificate-home.component";

const routes: Routes = [
    {
        path: "",
        component: CertificateHomeComponent,
        children: [
            { path: "", component: CertificateDefaultComponent }, // certificates/
            { path: ":thumbprint", component: CertificateDetailsComponent }, // certificate/{certificate.thumbprint}
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CertificateRoutingModule {

}
