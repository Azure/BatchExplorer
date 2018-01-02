import { Location } from "@angular/common";
import { Component } from "@angular/core";

import "./header.scss";

@Component({
    selector: "bl-header",
    templateUrl: "header.html",
})
export class HeaderComponent {
    constructor(
        private location: Location) { }

    public goBack() {
        this.location.back();
    }

    public goForward() {
        this.location.forward();
    }
}
