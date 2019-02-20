import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CloudFileService } from "@batch-flask/ui";
import { ResourceFile } from "app/models";
import { List } from "immutable";

import "./resource-files-properties.scss";

@Component({
    selector: "bl-resource-files-properties",
    templateUrl: "resource-files-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFilesPropertiesComponent {
    @Input() public files: ResourceFile[] | List<ResourceFile>;

    constructor(private cloudFileService: CloudFileService) {

    }

    public openResourceFile(file: ResourceFile) {
        if (file.httpUrl) {
            this.cloudFileService.openFile(file.httpUrl);
        }
    }
}
