import { ChangeDetectionStrategy, Component } from "@angular/core";
import { VersionService, VersionType } from "app/services";

import "./version-channel.scss";

@Component({
    selector: "bl-version-channel",
    templateUrl: "version-channel.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionChannelComponent {
    public VersionType = VersionType;

    public versionType: VersionType;

    constructor(versionService: VersionService) {
        this.versionType = versionService.versionType;
    }
}
