import { Component, Input } from "@angular/core";

@Component({
    standalone: false,
    selector: "bl-info-box",
    template: `
        {{message}}
    `,
})
export class InfoBoxMockComponent {
    @Input()
    public message: string;
}
