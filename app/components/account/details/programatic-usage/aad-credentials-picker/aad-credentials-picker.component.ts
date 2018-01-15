import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ResourceAccessService } from "app/services";

@Component({
    selector: "bl-aad-credentials-picker",
    templateUrl: "aad-credentials-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADCredentialsPickerComponent implements OnInit {
    constructor(
        private resourceAccessService: ResourceAccessService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.resourceAccessService.listRolesForCurrentAccount().subscribe((roles) => {
            console.log("Account roles are", roles.toJS());
        });
    }
}
