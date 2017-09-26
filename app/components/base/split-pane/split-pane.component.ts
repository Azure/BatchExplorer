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
        this.updateSize(this.config.initialDividerPosition);
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

    public updateSize(dividerPosition: number) {
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
            const { firstPane, secondPane } = this.config;
            if (dividerPosition < firstPane.minSize) {
                dividerPosition = firstPane.minSize;
            } else if (dividerPosition > rect.width - secondPane.minSize) {
                dividerPosition = rect.width - secondPane.minSize;
            }

            this.firstPaneSize = `${dividerPosition}px`;
            this.secondPaneSize = `calc(100% - ${dividerPosition}px)`;
        }
    }
}
