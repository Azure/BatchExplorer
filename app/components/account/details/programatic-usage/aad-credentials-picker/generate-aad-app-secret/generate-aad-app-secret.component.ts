import { Component, Input } from "@angular/core";

import { AADApplication } from "app/models/ms-graph";
import "./generate-aad-app-secret.scss";

@Component({
    selector: "bl-generate-aad-app-secret",
    templateUrl: "generate-aad-app-secret.html",
})
export class GenerateAADAppSecretComponent {
    @Input() public application: AADApplication;
}
