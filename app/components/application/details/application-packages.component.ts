import { Component, Input } from "@angular/core";

import { BatchApplication } from "app/models";

@Component({
    selector: "bl-application-packages",
    templateUrl: "application-packages.html",
})

export class ApplicationPackagesComponent {
    @Input()
    public application: BatchApplication;
}
