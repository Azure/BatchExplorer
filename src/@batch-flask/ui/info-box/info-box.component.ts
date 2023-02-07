import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-info-box",
    template: `
        <div class="infobox">
            <div class="infobox-image"><i class="fa fa-info-circle fa-3" aria-hidden="true"></i></div>
            <div class="infobox-text">{{message}}</div>
        </div>`,
})
export class InfoBoxComponent {
    @Input()
    public message: string;
}
