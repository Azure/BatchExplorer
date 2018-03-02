import { Component, EventEmitter, Input, Output } from "@angular/core";

import "./split-separator.scss";

@Component({
    selector: "bl-split-separator",
    templateUrl: "split-separator.html",
})
export class SplitSeparatorComponent {
    @Input() public thickness = 1;
    @Output() public willResize = new EventEmitter();
    @Output() public reset = new EventEmitter();

    public onDblClick(event) {
        this.reset.emit(true);
        return false;
    }

    public onMousedown(event) {
        this.willResize.emit(true);
        return false;
    }
}
