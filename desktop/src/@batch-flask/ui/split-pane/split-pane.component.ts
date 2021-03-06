import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
} from "@angular/core";

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
    initialDividerPosition: null,
};

@Component({
    selector: "bl-split-pane",
    templateUrl: "split-pane.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitPaneComponent implements OnInit, OnChanges {
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
    private _dividerPosision: number = null;

    constructor(private elementRef: ElementRef, private changeDetector: ChangeDetectorRef) { }

    public ngOnInit() {
        this.resetDividerPosition();
    }

    public ngOnChanges(changes) {
        if (changes.config) {
            this._computeSizes();
        }
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

    public updateSize(dividerPosision: number, fromEnd = false) {
        this._dividerPosision = dividerPosision;
        this._computeSizes();
    }

    public _computeSizes() {
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

        const result = this._getDividerPosision();
        let dividerPosition = result.dividerPosition;
        const fromEnd = result.fromEnd;

        if (dividerPosition === null) {
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
                this.firstPaneSize = `calc(100% - ${dividerPosition  + this.config.separatorThickness}px)`;
                this.secondPaneSize = `${dividerPosition}px`;
            } else {
                this.firstPaneSize = `${dividerPosition}px`;
                this.secondPaneSize = `calc(100% - ${dividerPosition + this.config.separatorThickness}px)`;

            }
        }
        this.changeDetector.markForCheck();
    }

    private _getDividerPosision() {
        const position = this._dividerPosision || this.config.initialDividerPosition;

        return {
            dividerPosition: position == null ? position : Math.abs(position),
            fromEnd: position < 0, // If negative
        };
    }
}
