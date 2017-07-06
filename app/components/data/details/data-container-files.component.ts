import { Component, Input } from "@angular/core";

import { BlobContainer } from "app/models";

@Component({
    selector: "bl-data-container-files",
    templateUrl: "data-container-files.html",
})

export class DataContainerFilesComponent {
    @Input()
    public container: BlobContainer;
}
