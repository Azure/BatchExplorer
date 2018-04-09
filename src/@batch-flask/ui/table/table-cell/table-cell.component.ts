import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input,
} from "@angular/core";

import { TableColumnComponent } from "../table-column";

@Component({
    selector: "bl-cell",
    templateUrl: "table-cell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent {
    /**
     * Specify the value here if its different from the content
     */
    @Input() public value: string;

    public set width(width: number) {
        this._width = width;
        this.changeDetector.markForCheck();
    }

    @HostBinding("class.fixed-size")
    public get fixedSize() {
        return this._width !== null;
    }

    @HostBinding("style.flex-basis")
    public get flexBasis() {
        return this._width && `${this._width}px`;
    }

    private _width: number;

    constructor(
        private changeDetector: ChangeDetectorRef) {
    }
}
