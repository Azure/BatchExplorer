import { Component, Input } from "@angular/core";
import { GaugeConfig } from "@bl-common/ui/graphs/gauge";

@Component({
    selector: "bl-gauge",
    template: `<div></div>`,
})
export class GaugeMockComponent {
    @Input()
    public value: number;

    @Input()
    public options: GaugeConfig;

    @Input()
    public size: string;
}
