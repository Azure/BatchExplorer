import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import * as tween from "@tweenjs/tween.js";

import { autobind } from "app/core";
import { VirtualScrollTailComponent } from "./virtual-scroll-tail";

import "./virtual-scroll.scss";

export interface ChangeEvent {
    start?: number;
    end?: number;
}

interface VirtualScrollDimensions {
    itemCount: number;
    viewWidth: number;
    viewHeight: number;
    childWidth: number;
    childHeight: number;
    itemsPerRow: number;
    itemsPerCol: number;
    scrollHeight: number;
    tail: number;
}

@Component({
    selector: "bl-virtual-scroll",
    templateUrl: "virtual-scroll.html",
})
export class VirtualScrollComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public items: any[] = [];

    @Input() public scrollbarWidth: number;

    @Input() public scrollbarHeight: number;

    @Input() public childWidth: number;

    /**
     * Heigth of the rows. This is required to compute which row to show
     */
    @Input() public childHeight: number;

    @Input() public bufferAmount: number = 0;

    @Input() public set parentScroll(element: Element | Window) {
        if (this._parentScroll === element) {
            return;
        }
        this._removeParentEventHandlers(this._parentScroll);
        this._parentScroll = element;
        this._addParentEventHandlers(this._parentScroll);
    }

    public get parentScroll(): Element | Window {
        return this._parentScroll;
    }

    @Output() public update = new EventEmitter<any[]>();
    @Output() public change = new EventEmitter<ChangeEvent>();
    @Output() public start = new EventEmitter<ChangeEvent>();
    @Output() public end = new EventEmitter<ChangeEvent>();
    @Output() public scroll = new EventEmitter<Event>();

    public viewPortItems: any[];

    @ViewChild("content", { read: ElementRef })
    public contentElementRef: ElementRef;

    @ContentChild(VirtualScrollTailComponent)
    public set tail(tail: VirtualScrollTailComponent) {
        this._tail = tail;
    }
    public get tail() { return this._tail; }

    public topPadding: number;
    public previousStart: number;
    public previousEnd: number;
    public startupLoop: boolean = true;
    public currentTween: any;

    private _parentScroll: Element | Window;
    /** Cache of the last scroll height to prevent setting CSS when not needed. */
    private _lastScrollHeight = -1;
    private _lastTopPadding = -1;
    private _tail: VirtualScrollTailComponent;

    @ViewChild("padding", { read: ElementRef })
    private _paddingElementRef: ElementRef;

    constructor(
        private readonly element: ElementRef,
        private readonly zone: NgZone,
        private readonly renderer: Renderer2,
    ) { }

    @HostBinding("style.overflow-y")
    public get overflow() {
        return this.parentScroll ? "hidden" : "auto";
    }

    @HostListener("scroll")
    public onScroll() {
        this.refresh();
    }

    public ngOnInit() {
        this.scrollbarWidth = 0;
        this.scrollbarHeight = 0;
    }

    public ngOnDestroy() {
        this._removeParentEventHandlers(this.parentScroll);
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.previousStart = undefined;
        this.previousEnd = undefined;
        if (changes.items) {
            const { previousValue } = changes.items;
            if (previousValue === undefined || previousValue.length === 0) {
                this.startupLoop = true;
            }
        }

        this.refresh();
    }

    @autobind()
    public refresh() {
        requestAnimationFrame(() => this._calculateItems());
    }

    public scrollToBottom() {
        this.scrollToItemAt((this.items || []).length - 1);
    }

    public scrollToItem(item: any) {
        const index: number = (this.items || []).indexOf(item);
        if (index < 0 || index >= (this.items || []).length) { return; }
        this.scrollToItemAt(index);
    }

    public scrollToItemAt(index: number) {
        const el = this._getScrollElement();
        if (index < 0 || index >= (this.items || []).length) { return; }

        const d = this._calculateDimensions();
        const scrollTop = (Math.floor(index / d.itemsPerRow) * d.childHeight)
            - (d.childHeight * Math.min(index, this.bufferAmount));
        if (this.currentTween) {
            this.currentTween.stop();
        }
        this.currentTween = new tween.Tween({ scrollTop: el.scrollTop })
            .to({ scrollTop }, 500)
            .easing(tween.Easing.Quadratic.Out)
            .onUpdate((data) => {
                if (!isNaN(data.scrollTop)) {
                    this.renderer.setProperty(el, "scrollTop", data.scrollTop);
                }
                this.refresh();
            })
            .start();

        const animate = (time?) => {
            this.currentTween.update(time);
            if (this.currentTween._object.scrollTop !== scrollTop) {
                this.zone.runOutsideAngular(() => {
                    requestAnimationFrame(animate);
                });
            }
        };

        animate();
    }

    private _getScrollElement(): Element {
        return this.parentScroll instanceof Window ? document.body : this.parentScroll || this.element.nativeElement;
    }

    private _addParentEventHandlers(parentScroll: Element | Window) {
        if (!parentScroll) { return; }
        parentScroll.addEventListener("scroll", this.refresh);
        if (parentScroll instanceof Window) {
            parentScroll.addEventListener("resize", this.refresh);
        }
    }

    private _removeParentEventHandlers(parentScroll: Element | Window) {
        if (!parentScroll) { return; }
        parentScroll.removeEventListener("scroll", this.refresh);
        if (parentScroll instanceof Window) {
            parentScroll.removeEventListener("resize", this.refresh);
        }
    }

    private _getElementsOffset(): number {
        let offsetTop = 0;
        if (this.parentScroll) {
            offsetTop += this.element.nativeElement.offsetTop;
        }
        return offsetTop;
    }

    private _calculateDimensions(): VirtualScrollDimensions {
        const el = this._getScrollElement();
        const items = this.items || [];
        const itemCount = items.length;
        const viewWidth = el.clientWidth - this.scrollbarWidth;
        const viewHeight = el.clientHeight - this.scrollbarHeight;

        const containerDimensions = this.element.nativeElement.getBoundingClientRect();
        const childWidth = this.childWidth || containerDimensions.width;
        const childHeight = this.childHeight || containerDimensions.height;

        const itemsPerRow = Math.max(1, Math.floor(viewWidth / childWidth));
        const itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
        const tail = this.tail && this.tail.height || 0;
        const scrollHeight = childHeight * Math.ceil(itemCount / itemsPerRow) + tail;

        if (scrollHeight !== this._lastScrollHeight) {
            this.renderer.setStyle(this._paddingElementRef.nativeElement, "height", `${scrollHeight}px`);
            this._lastScrollHeight = scrollHeight;
        }

        return {
            itemCount: itemCount,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
            childWidth: childWidth,
            childHeight: childHeight,
            itemsPerRow: itemsPerRow,
            itemsPerCol: itemsPerCol,
            tail,
            scrollHeight,
        };
    }

    private _calculateItems(forceViewportUpdate: boolean = false) {
        const d = this._calculateDimensions();
        const items = this.items || [];
        let { start, end } = this._computeRange(d);

        this._applyTopPadding(items, start, d);

        start = !isNaN(start) ? start : -1;
        end = !isNaN(end) ? end : -1;
        start -= this.bufferAmount;
        start = Math.max(0, start);
        end += this.bufferAmount;
        end = Math.min(items.length, end);
        this._detectViewportChanges(items, start, end, forceViewportUpdate);
    }

    private _computeRange(d: VirtualScrollDimensions) {
        console.log("Compute range", d.scrollHeight);
        const scrollTop = this._computeScrollTop(d);
        const indexByScrollTop = scrollTop / d.scrollHeight * d.itemCount / d.itemsPerRow;
        const end = Math.min(d.itemCount, d.itemsPerRow * (Math.ceil(indexByScrollTop) + d.itemsPerCol + 1));
        let maxStartEnd = end;
        const modEnd = end % d.itemsPerRow;
        if (modEnd) {
            maxStartEnd = end + d.itemsPerRow - modEnd;
        }
        const maxStart = Math.max(0, maxStartEnd - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
        const start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);

        return { start, end };
    }

    private _computeScrollTop(d): number {
        const el = this._getScrollElement();
        const offsetTop = this._getElementsOffset();

        let elScrollTop = this.parentScroll instanceof Window
            ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
            : el.scrollTop;

        if (elScrollTop > d.scrollHeight) {
            elScrollTop = d.scrollHeight + offsetTop;
        }

        return Math.max(0, elScrollTop - offsetTop);
    }

    private _applyTopPadding(items, start, d: VirtualScrollDimensions) {
        let topPadding = 0;
        if (items) {
            topPadding = d.childHeight * (Math.ceil(start / d.itemsPerRow) - Math.min(start, this.bufferAmount));
        }
        if (topPadding !== this._lastTopPadding) {
            this.renderer.setStyle(this.contentElementRef.nativeElement, "transform", `translateY(${topPadding}px)`);
            this._lastTopPadding = topPadding;
        }
    }

    private _detectViewportChanges(items: any, start: number, end: number, forceViewportUpdate: boolean) {
        if (start !== this.previousStart || end !== this.previousEnd || forceViewportUpdate === true) {
            this.zone.run(() => {
                this._applyViewportChanges(items, start, end, forceViewportUpdate);
            });
        } else if (this.startupLoop === true) {
            this.startupLoop = false;
            this.refresh();
        }
    }

    private _applyViewportChanges(items: any, start: number, end: number, forceViewportUpdate: boolean) {
        console.log("Chagnes?", { items: items.length, start, end });
        // To prevent from accidentally selecting the entire array with a negative 1 (-1) in the end position.
        const _end = end >= 0 ? end : 0;
        // update the scroll list
        this.viewPortItems = items.slice(start, _end);
        this.update.emit(this.viewPortItems);

        // emit 'start' event
        if (start !== this.previousStart && this.startupLoop === false) {
            this.start.emit({ start, end });
        }

        // emit 'end' event
        if (end !== this.previousEnd && this.startupLoop === false) {
            this.end.emit({ start, end });
        }

        this.previousStart = start;
        this.previousEnd = end;

        if (this.startupLoop === true) {
            this.refresh();
        } else {
            this.change.emit({ start, end });
        }
    }
}
