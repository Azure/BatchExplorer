import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostBinding } from "@angular/core";
import { OS } from "app/utils";

import "./header.scss";

@Component({
    selector: "bl-header",
    templateUrl: "header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    @HostBinding("class.skip-osx-buttons")
    public get skipOsxButtons() {
        return OS.isOSX();
    }
    constructor(private location: Location) { }

    public goBack() {
        this.location.back();
    }

    public goForward() {
        this.location.forward();
    }
}
