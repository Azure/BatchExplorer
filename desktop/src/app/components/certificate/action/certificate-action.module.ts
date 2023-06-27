import { NgModule } from "@angular/core";
import { BaseModule } from "@batch-flask/ui";
import { commonModules } from "app/common";
import { JobActionModule } from "app/components/job/action";
import { AddCertificateFormComponent } from "./add/add-certificate-form.component";
import { ReactivateCertificateDialogComponent } from "./reactivate/reactivate-certificate-dialog.component";

const components = [
    ReactivateCertificateDialogComponent, AddCertificateFormComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules, JobActionModule, BaseModule],
    entryComponents: components,
})
export class CertificateActionModule {
}
