import { Component, Input } from "@angular/core";

import { Application } from "app/models";

@Component({
    selector: "bl-application-packages",
    templateUrl: "application-packages.html",
})

export class ApplicationPackagesComponent {
    @Input()
    public application: Application;
}
