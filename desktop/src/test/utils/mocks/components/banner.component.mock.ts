import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-banner",
    template: `<div>{{fixMessage}}<ng-content></ng-content></div>`,
})
export class BannerMockComponent {
    @Input() public fixMessage: string;
    @Input() public fix;

    public triggerFix() {
        this.fix();
    }
}
