import { NgModule } from "@angular/core";

import { BaseModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { JobActionModule } from "app/components/job/action";
import { CertificateCreateDialogComponent } from "./add/certificate-create-dialog.component";
import { DeleteCertificateDialogComponent } from "./delete/delete-certificate-dialog.component";
import { ReactivateCertificateDialogComponent } from "./reactivate/reactivate-certificate-dialog.component";

const components = [
    DeleteCertificateDialogComponent, ReactivateCertificateDialogComponent, CertificateCreateDialogComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, JobActionModule, BaseModule],
    entryComponents: components,
})
export class CertificateActionModule {
}
