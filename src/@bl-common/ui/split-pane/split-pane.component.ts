import { Component, ElementRef, HostListener, Input, OnInit } from "@angular/core";

import "./split-pane.scss";

export interface PanelConfig {
    minSize?: number;
    hidden?: boolean;
}

export interface SplitPaneConfig {
    separatorThickness?: number;
    firstPane?: PanelConfig;
    secondPane?: PanelConfig;
    initialDividerPosition?: number;
}

const defaultConfig: SplitPaneConfig = {
    separatorThickness: 1,
    firstPane: {
        minSize: 10,
        hidden: false,
    },
    secondPane: {
        minSize: 10,
        hidden: false,
    },
    initialDividerPosition: -1,
};

@Component({
    selector: "bl-split-pane",
    templateUrl: "split-pane.html",
})
export class SplitPaneComponent implements OnInit {
    @Input() public set config(config: SplitPaneConfig) {
        const newConfig = {
            ...defaultConfig,
            ...config,
        };

        if (config) {
            newConfig.firstPane = { ...defaultConfig.firstPane, ...config.firstPane };
            newConfig.secondPane = { ...defaultConfig.secondPane, ...config.secondPane };
        }
        this._config = newConfig;
    }
    public get config() { return this._config; }

    public isResizing = false;

    public firstPaneSize = "";
    public secondPaneSize = "";

    private _config: SplitPaneConfig = defaultConfig;

    constructor(private elementRef: ElementRef) { }

    public ngOnInit() {
        this.resetDividerPosition();
    }

    public handleStartResize(event: MouseEvent) {
        this.isResizing = true;
    }

    public resetDividerPosition() {
        const value = this.config.initialDividerPosition;
        if (value === -1) {
            this.updateSize(-1);
        } else {
            this.updateSize(Math.abs(value), value < 0);
        }
    }

    @HostListener("document:mouseup")
    public stopResizing() {
        this.isResizing = false;
    }

    @HostListener("mousemove", ["$event"])
    public onMousemove(event: MouseEvent) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        if (this.isResizing) {
            this.updateSize(event.clientX - rect.left);
        }
    }

    public updateSize(dividerPosition: number, fromEnd = false) {
        if (this.config.firstPane.hidden) {
            this.firstPaneSize = "0px";
            this.secondPaneSize = "100%";
            return;
        } else if (this.config.secondPane.hidden) {
            this.firstPaneSize = "100%";
            this.secondPaneSize = "0px";
            return;
        }

        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        if (dividerPosition === -1) {
            this.firstPaneSize = "50%";
            this.secondPaneSize = "50%";
        } else {
            let { firstPane, secondPane } = this.config;
            if (rect.width !== 0) { // When initialized
                if (fromEnd) {
                    [firstPane, secondPane] = [secondPane, firstPane];
                }
                if (dividerPosition > rect.width - secondPane.minSize) {
                    dividerPosition = rect.width - secondPane.minSize;
                }
                if (dividerPosition < firstPane.minSize) {
                    dividerPosition = firstPane.minSize;
                }
            }
            if (fromEnd) {
                this.firstPaneSize = `calc(100% - ${dividerPosition}px)`;
                this.secondPaneSize = `${dividerPosition}px`;
            } else {
                this.firstPaneSize = `${dividerPosition}px`;
                this.secondPaneSize = `calc(100% - ${dividerPosition}px)`;

            }
        }
    }
}
