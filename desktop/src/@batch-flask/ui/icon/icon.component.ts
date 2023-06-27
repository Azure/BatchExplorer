import { Component, Input } from "@angular/core";
import { Icon } from "./icon.model";

@Component({
    selector: "bl-icon",
    templateUrl: "icon.html",
})
export class IconComponent {
    @Input()
    public icon: Icon;
}
