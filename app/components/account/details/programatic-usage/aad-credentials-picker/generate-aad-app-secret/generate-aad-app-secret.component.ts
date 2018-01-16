import { Component, Input } from "@angular/core";

import { ServicePrincipal } from "app/models/ms-graph";
import "./generate-aad-app-secret.scss";

@Component({
    selector: "bl-generate-aad-app-secret",
    templateUrl: "generate-aad-app-secret.html",
})
export class GenerateAADAppSecretComponent {
    @Input() public app: ServicePrincipal;
}
