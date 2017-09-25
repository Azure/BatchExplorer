import { Component, ElementRef, HostListener, Input, OnInit } from "@angular/core";

import "./split-pane.scss";

export interface PanelConfig {
    minSize?: number;
    hidden?: boolean;
}

export interface SplitPaneConfig {
    separatorThickness?: number;
    firstPanel?: PanelConfig;
    secondPanel?: PanelConfig;
    initialDividerPosition?: number;
}

const defaultConfig: SplitPaneConfig = {
    separatorThickness: 1,
    firstPanel: {
        minSize: 10,
        hidden: false,
    },
    secondPanel: {
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
            newConfig.firstPanel = { ...defaultConfig.firstPanel, ...config.firstPanel };
            newConfig.secondPanel = { ...defaultConfig.secondPanel, ...config.secondPanel };
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
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        if (dividerPosition === -1) {
            this.firstPaneSize = "50%";
            this.secondPaneSize = "50%";
        } else {
            const { firstPanel, secondPanel } = this.config;
            if (dividerPosition < firstPanel.minSize) {
                dividerPosition = firstPanel.minSize;
            } else if (dividerPosition > rect.width - secondPanel.minSize) {
                dividerPosition = rect.width - secondPanel.minSize;
            }

            this.firstPaneSize = `${dividerPosition}px`;
            this.secondPaneSize = `calc(100% - ${dividerPosition}px)`;
        }
    }
}
