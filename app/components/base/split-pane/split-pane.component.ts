import { Component, ElementRef, HostListener, Input } from "@angular/core";

import "./split-pane.scss";

export interface SplitPaneConfig {
    separatorThickness?: number;
    firstPaneMinSize?: number;
    secondPaneMinSize?: number;
    initialDividerPosition?: number;
}

const defaultConfig: SplitPaneConfig = {
    separatorThickness: 1,
    firstPaneMinSize: 10,
    secondPaneMinSize: 10,
    initialDividerPosition: -1,
};

@Component({
    selector: "bl-split-pane",
    templateUrl: "split-pane.html",
})
export class SplitPaneComponent {
    @Input() public set config(config: SplitPaneConfig) {
        this._config = { ...defaultConfig, ...config };
    }
    public get config() { return this._config; }

    public isResizing = false;

    public firstPaneSize = "";
    public secondPaneSize = "";

    private _config: SplitPaneConfig = defaultConfig;

    constructor(private elementRef: ElementRef) { }

    public ngOnInit() {
        this.updateSize(this.config.initialDividerPosition);
    }

    public handleStartResize(event: MouseEvent) {
        console.log("Handle start resiz", event);
        this.isResizing = true;
    }

    @HostListener("document:mouseup")
    public stopResizing() {
        this.isResizing = false;
    }

    @HostListener("mousemove", ["$event"])
    public onMousemove(event: MouseEvent) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        if (this.isResizing) {
            console.log("Event", event.clientX - rect.left);
            this.updateSize(event.clientX - rect.left);
        }
    }

    public updateSize(dividerPosition: number) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        if (dividerPosition === -1) {
            this.firstPaneSize = "50%";
            this.secondPaneSize = "50%";
        } else {
            if (dividerPosition < this.config.firstPaneMinSize) {
                dividerPosition = this.config.firstPaneMinSize;
            } else if (dividerPosition > rect.width - this.config.secondPaneMinSize) {
                dividerPosition = rect.width - this.config.secondPaneMinSize;
            }

            this.firstPaneSize = `${dividerPosition}px`;
            this.secondPaneSize = `calc(100% - ${dividerPosition}px)`;
            console.log("FIrst", this.firstPaneSize, this.secondPaneSize);
        }
    }
}
