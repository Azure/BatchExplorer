import { ChangeDetectionStrategy, Component } from "@angular/core";
import { VersionService, VersionType } from "app/services";

import "./version-type.scss";

@Component({
    selector: "bl-version-type",
    templateUrl: "version-type.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionTypeComponent {
    public VersionType = VersionType;

    public versionType: VersionType;

    constructor(versionService: VersionService) {
        this.versionType = versionService.versionType;
    }
}
