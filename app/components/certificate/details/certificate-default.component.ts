import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "bl-certificate-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-certificate large"></i>
            <p>Please select a certificate from the list</p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CertificateDefaultComponent {
    public static breadcrumb() {
        return { name: "Certificates" };
    }
}
