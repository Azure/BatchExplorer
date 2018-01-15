import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { AccountResource, RoleAssignmentPrincipalType } from "app/models";
import { ResourceAccessService } from "app/services";
import { ServicePrincipalService } from "app/services/ms-graph";

import "./aad-credentials-picker.scss";

@Component({
    selector: "bl-aad-credentials-picker",
    templateUrl: "aad-credentials-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADCredentialsPickerComponent implements OnInit {
    @Input() public account: AccountResource;

    constructor(
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.resourceAccessService.listRolesForCurrentAccount().subscribe((roles) => {
            const apps = roles.filter(x => x.properties.principalType === RoleAssignmentPrincipalType.App);
            console.log("Account roles are", apps.map(x => x.properties.principalId).toJS());
            this.servicePrincipalService.get(apps.map(x => x.properties.principalId).first()).subscribe((x) => {
                console.log("Service principal", x);
            });

            this.changeDetector.markForCheck();
        });
    }
}
