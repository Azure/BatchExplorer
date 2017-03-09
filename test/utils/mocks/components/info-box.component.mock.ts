import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-info-box",
    template: `
        {{message}}
    `,
})
export class InfoBoxMockComponent {
    @Input()
    public message: string;
}
