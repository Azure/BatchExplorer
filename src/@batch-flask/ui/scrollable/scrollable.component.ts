import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import * as elementResizeDetectorMaker from "element-resize-detector";

import { SecureUtils } from "@batch-flask/utils";
import { ScrollableService } from "./scrollable.service";

enum Orientation {
    Horizontal,
    Vertical,
}

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bl-scrollable",
    templateUrl: "scrollable.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollableComponent implements OnDestroy, AfterViewInit {
    public orientations = Orientation;

    public dragOffset = { [Orientation.Horizontal]: 0, [Orientation.Vertical]: 0 };

    /**
     * If the content is long enough to need a scrollbar
     */
    public isScrollbarNeeded = { [Orientation.Horizontal]: true, [Orientation.Vertical]: true };

    /**
     * If the scrollbar should be displayed
     */
    public scrollbarVisible = { [Orientation.Horizontal]: false, [Orientation.Vertical]: false };

    /**
     * If we are currently dragging the scrollbar
     */
    public dragging = false;

    /**
     * Margin at which the scrolledToBottom will be triggered.
     * If 0 the content needs to be scroll all the way to the bottom
     * otherwise at x pixel from the bottom it will start triggering.
     */
    @Input()
    public scrollMargin: number = 0;

    @Output()
    public scrollBottom = new EventEmitter<number>();

    @ViewChild("scrollable")
    public scrollable;

    @ViewChild("trackY")
    public trackY;

    @ViewChild("scrollbarY")
    public scrollbarY;

    @ViewChild("trackX")
    public trackX;

    @ViewChild("scrollbarX")
    public scrollbarX;

    @ViewChild("scrollContent")
    public scrollContent;

    @ViewChild("content")
    public simpleBarContent;

    @HostBinding("attr.sid")
    public id: string;

    private flashTimeout: any;
    private erd: any;
    private _currentDragEventCallbacks: any;
    private _lastScroll = { left: 0, top: 0 };

    constructor(
        private elementRef: ElementRef,
        private scrollableService: ScrollableService,
        private changeDetector: ChangeDetectorRef) {
        this.id = SecureUtils.uuid();
        this.scrollableService.registerScrollable(this);
    }

    public ngAfterViewInit() {
        this.resizeScrollContent();
        this.resizeScrollbar();

        this.drag = this.drag.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);

        this.erd = elementResizeDetectorMaker({
            strategy: "scroll",
        });

        this.erd.listenTo(this.elementRef.nativeElement, (element) => {
            this.update();
            const contentHeight = this.simpleBarContent.nativeElement.offsetHeight;
            const containerHeight = this.scrollable.nativeElement.offsetHeight;
            if (contentHeight + this.scrollMargin <= containerHeight) {
                this.scrollBottom.emit();
            }
        });
    }

    @HostListener("scroll")
    public onScroll() {
        const currentSroll = {
            left: this.scrollContent.nativeElement.scrollLeft,
            top: this.scrollContent.nativeElement.scrollTop,
        };
        if (currentSroll.left !== this._lastScroll.left) {
            this.flashScrollbar(Orientation.Horizontal);
        }
        if (currentSroll.top !== this._lastScroll.top) {
            this.flashScrollbar(Orientation.Vertical);
        }
        this._lastScroll = currentSroll;
        if (this.scrolledToBottom()) {
            this.scrollBottom.emit(this.scrollTop());
        }
    }

    public update() {
        this.resizeScrollContent();
        this.resizeScrollbar(Orientation.Vertical);
        // this.resizeScrollbar(Orientation.Horizontal);
    }

    /**
     * Scroll the content to a specific position
     */
    public scrollTo(position: number) {
        this.scrollContent.nativeElement.scrollTop = position;
        this.update();
    }

    /**
     * Scroll to the bottom of the content
     */
    public scrollToBottom() {
        this.scrollTo(this.scrollContent.nativeElement.scrollHeight);
    }

    public ngOnDestroy() {
        if (this.erd) {
            this.erd.uninstall(this.elementRef.nativeElement);
        }
        this.scrollableService.unregisterScrollable(this);
    }

    /**
     * Resize content element
     */
    public resizeScrollContent() {
        this.scrollContent.nativeElement.style.width = `${this.scrollable.nativeElement.offsetWidth}px`;
        this.scrollContent.nativeElement.style.height = `${this.scrollable.nativeElement.offsetHeight}px`;
    }

    /**
     * Resize scrollbar
     */
    public resizeScrollbar(orientation = Orientation.Vertical) {
        const track = this._track(orientation);
        const scrollbar = this._scrollbar(orientation);
        const contentSize = this._contentSize(orientation);
        const scrollOffset = this._scrollOffset(orientation);
        const scrollbarSize = this._scrollbarSize(orientation);
        const scrollbarRatio = scrollbarSize / contentSize;
        // Calculate new height/position of drag handle.
        // Offset of 2px allows for a small top/bottom or left/right margin around handle.
        const handleOffset = Math.round(scrollbarRatio * scrollOffset) + 2;
        const handleSize = Math.floor(scrollbarRatio * (scrollbarSize - 2)) - 2;

        // Set isVisible to false if scrollbar is not necessary (content is shorter than wrapper)
        this.isScrollbarNeeded[orientation] = scrollbarSize < contentSize;

        if (this.isScrollbarNeeded[orientation]) {
            track.style.visibility = "visible";
            if (orientation === Orientation.Vertical) {
                scrollbar.style.top = `${handleOffset}px`;
                scrollbar.style.height = `${handleSize}px`;
            } else {
                scrollbar.style.left = `${handleOffset}px`;
                scrollbar.style.width = `${handleSize}px`;
            }
        } else {
            track.style.visibility = "hidden";
        }
    }

    /**
     * Flash scrollbar visibility
     */
    public flashScrollbar(orientation: Orientation = null) {
        if (orientation !== null) {
            this.resizeScrollbar(orientation);
            this.showScrollbar(orientation);
        } else {
            this.resizeScrollbar(Orientation.Vertical);
            this.resizeScrollbar(Orientation.Horizontal);
            this.showScrollbar(Orientation.Vertical);
            this.showScrollbar(Orientation.Horizontal);
        }
    }

    /**
     * Show scrollbar
     */
    public showScrollbar(orientation: Orientation) {
        if (!this.isScrollbarNeeded) {
            return;
        }

        this.scrollbarVisible[orientation] = true;

        if (this.flashTimeout) {
            window.clearTimeout(this.flashTimeout);
        }

        this.flashTimeout = window.setTimeout(this.hideScrollbar.bind(this, orientation), 1000);
        this.changeDetector.markForCheck();
    }

    /**
     * Hide Scrollbar
     */
    public hideScrollbar(orientation: Orientation) {
        this.scrollbarVisible[orientation] = false;

        if (this.flashTimeout) {
            window.clearTimeout(this.flashTimeout);
        }
        this.changeDetector.markForCheck();
    }

    /**
     * Start scrollbar handle drag
     */
    public startDrag(e, orientation: Orientation) {
        // Preventing the event's default action stops text being
        // selectable during the drag.
        e.preventDefault();
        this.dragging = true;
        const scrollbar = this._scrollbar(orientation);
        // Measure how far the user's mouse is from the top of the scrollbar drag handle.
        const eventOffset = orientation === Orientation.Vertical ? e.pageY : e.pageX;
        const val = orientation === Orientation.Vertical
            ? scrollbar.getBoundingClientRect().top
            : scrollbar.getBoundingClientRect().left;

        this.dragOffset[orientation] = eventOffset - val;
        this._currentDragEventCallbacks = {
            mousemove: _ => this.drag(_, orientation),
            mouseup: () => this.endDrag(orientation),
        };
        document.addEventListener("mousemove", this._currentDragEventCallbacks.mousemove);
        document.addEventListener("mouseup", this._currentDragEventCallbacks.mouseup);
    }

    /**
     * Drag scrollbar handle
     */
    public drag(e, orientation: Orientation) {
        e.preventDefault();

        const eventOffset = orientation === Orientation.Vertical ? e.pageY : e.pageX;
        const track = this._track(orientation);

        const val = orientation === Orientation.Vertical
            ? track.getBoundingClientRect().top
            : track.getBoundingClientRect().left;

        // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).
        const dragPos = eventOffset - val - this.dragOffset[orientation];
        // Convert the mouse position into a percentage of the scrollbar height/width.
        const dragPerc = dragPos / this._scrollbarSize(orientation);

        // Scroll the content by the same percentage.
        const scrollPos = dragPerc * this._contentSize(orientation);

        if (orientation === Orientation.Vertical) {
            this.scrollContent.nativeElement.scrollTop = scrollPos;
        } else {
            this.scrollContent.nativeElement.scrollLeft = scrollPos;
        }
    }

    /**
     * End scroll handle drag
     */
    public endDrag(orientation: Orientation) {
        this.dragging = false;
        // TODO fix
        document.removeEventListener("mousemove", this._currentDragEventCallbacks.mousemove);
        document.removeEventListener("mouseup", this._currentDragEventCallbacks.mouseup);
    }

    private scrollTop(): number {
        return this.scrollContent.nativeElement.scrollTop;
    }

    private currentHeight(): number {
        return this.elementRef.nativeElement.offsetHeight;
    }

    private currentContentHeight(): number {
        return this.simpleBarContent.nativeElement.offsetHeight;
    }

    private scrolledToBottom(): boolean {
        const scrollTop = this.scrollTop();
        const height = this.currentHeight();
        const contentHeight = this.currentContentHeight();
        return height + scrollTop + this.scrollMargin >= contentHeight;
    }

    private _track(orientation: Orientation) {
        return orientation === Orientation.Vertical ? this.trackY.nativeElement : this.trackX.nativeElement;
    }

    private _scrollbar(orientation: Orientation) {
        return orientation === Orientation.Vertical ? this.scrollbarY.nativeElement : this.scrollbarX.nativeElement;
    }

    private _contentSize(orientation: Orientation) {
        const el = this.scrollContent.nativeElement;
        return orientation === Orientation.Vertical ? el.scrollHeight : el.scrollWidth;
    }

    private _scrollOffset(orientation: Orientation) {
        const el = this.scrollContent.nativeElement;
        return orientation === Orientation.Vertical ? el.scrollTop : el.scrollLeft;
    }

    private _scrollbarSize(orientation: Orientation) {
        const track = this._track(orientation);
        return orientation === Orientation.Vertical ? track.offsetHeight : track.offsetWidth;
    }
}
