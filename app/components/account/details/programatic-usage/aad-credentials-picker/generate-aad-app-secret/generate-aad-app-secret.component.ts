import { Component, Input, OnChanges } from "@angular/core";

import { AADApplication } from "app/models/ms-graph";
import { AADApplicationService } from "app/services/ms-graph";
import "./generate-aad-app-secret.scss";

@Component({
    selector: "bl-generate-aad-app-secret",
    templateUrl: "generate-aad-app-secret.html",
})
export class GenerateAADAppSecretComponent implements OnChanges {
    @Input() public application: AADApplication;

    constructor(private aadApplicationService: AADApplicationService) { }
    public ngOnChanges(changes) {
        if (this.application) {
            console.log("PAssword creds", this.application.passwordCredentials.map(x => x.name).toJS(), this.application.passwordCredentials.toJS());
            this.aadApplicationService.createSecret(this.application.id, "New pass").subscribe((result) => {
                console.log("Result is", result);
            });
        }
    }
}
