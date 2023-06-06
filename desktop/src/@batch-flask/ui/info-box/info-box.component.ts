import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-info-box",
    templateUrl: "info-box.html",
})
export class InfoBoxComponent {
    @Input()
    public message: string;
}
