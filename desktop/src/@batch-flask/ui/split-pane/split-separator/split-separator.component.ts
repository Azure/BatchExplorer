import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

import "./split-separator.scss";

@Component({
    selector: "bl-split-separator",
    templateUrl: "split-separator.html",
})
export class SplitSeparatorComponent {
    @Input() public thickness = 1;
    @Output() public willResize = new EventEmitter();
    @Output() public reset = new EventEmitter();

    @HostBinding("style.width") public get width() {
        return `${this.thickness}px`;
    }

    public onDblClick(event) {
        this.reset.emit(true);
        return false;
    }

    public onMousedown(event) {
        this.willResize.emit(true);
        return false;
    }
}
