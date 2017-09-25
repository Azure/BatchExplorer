import { Component, EventEmitter, Input, Output } from "@angular/core";

import "./split-separator.scss";

@Component({
    selector: "bl-split-separator",
    templateUrl: "split-separator.html",
})
export class SplitSeparatorComponent {
    @Input() public thickness = 1;
    @Output() public willResize = new EventEmitter();

    public onMousedown(event) {
        this.willResize.emit(true);
        return false;
    }
}
