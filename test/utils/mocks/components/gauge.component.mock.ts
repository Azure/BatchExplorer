import { Component, Input } from "@angular/core";
import { GaugeConfig } from "app/components/base/graphs/gauge";

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
