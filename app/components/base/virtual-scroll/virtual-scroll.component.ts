import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";

export interface ChangeEvent {
    start?: number;
    end?: number;
}

import { autobind } from "core-decorators";
import "./virtual-scroll.scss";

@Component({
    selector: "bl-virtual-scroll",
    templateUrl: "virtual-scroll.html",
})
export class VirtualScrollComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public items: any[] = [];

    @Input() public scrollbarWidth: number;

    @Input() public scrollbarHeight: number;

    @Input() public childWidth: number;

    @Input() public childHeight: number;

    @Input() public bufferAmount: number = 0;

    @Input() public scrollAnimationTime: number = 1500;

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

    public viewPortItems: any[];

    @ViewChild("content", { read: ElementRef })
    public contentElementRef: ElementRef;

    @ContentChild("container")
    public containerElementRef: ElementRef;

    public topPadding: number;
    public scrollHeight: number;
    public previousStart: number;
    public previousEnd: number;
    public startupLoop: boolean = true;
    public currentTween: any;
    public window = window;

    private _parentScroll: Element | Window;

    constructor(private element: ElementRef) { }

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

    public scrollInto(item: any) {
        const el = this._getScrollElement();
        const index: number = (this.items || []).indexOf(item);
        if (index < 0 || index >= (this.items || []).length) { return; }

        const d = this._calculateDimensions();
        const scrollTop = (Math.floor(index / d.itemsPerRow) * d.childHeight)
            - (d.childHeight * Math.min(index, this.bufferAmount));
        el.scrollTop = scrollTop;
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

    private _countItemsPerRow() {
        let offsetTop;
        const children = this.contentElementRef.nativeElement.children;
        for (let itemsPerRow = 0; itemsPerRow < children.length; itemsPerRow++) {
            if (offsetTop !== undefined && offsetTop !== children[itemsPerRow].offsetTop) {
                return itemsPerRow;
            }
            offsetTop = children[itemsPerRow].offsetTop;
        }
    }

    private _getElementsOffset(): number {
        let offsetTop = 0;
        if (this.containerElementRef && this.containerElementRef.nativeElement) {
            offsetTop += this.containerElementRef.nativeElement.offsetTop;
        }
        if (this.parentScroll) {
            offsetTop += this.element.nativeElement.offsetTop;
        }
        return offsetTop;
    }

    private _calculateDimensions() {
        const el = this._getScrollElement();
        const items = this.items || [];
        const itemCount = items.length;
        const viewWidth = el.clientWidth - this.scrollbarWidth;
        const viewHeight = el.clientHeight - this.scrollbarHeight;

        let contentDimensions;
        if (this.childWidth === undefined || this.childHeight === undefined) {
            let content = this.contentElementRef.nativeElement;
            if (this.containerElementRef && this.containerElementRef.nativeElement) {
                content = this.containerElementRef.nativeElement;
            }
            contentDimensions = content.children[0] ? content.children[0].getBoundingClientRect() : {
                width: viewWidth,
                height: viewHeight,
            };
        }
        const childWidth = this.childWidth || contentDimensions.width;
        const childHeight = this.childHeight || contentDimensions.height;

        let itemsPerRow = Math.max(1, this._countItemsPerRow());
        const itemsPerRowByCalc = Math.max(1, Math.floor(viewWidth / childWidth));
        const itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
        const elScrollTop = this.parentScroll instanceof Window
            ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
            : el.scrollTop;
        const scrollTop = Math.max(0, elScrollTop);
        if (itemsPerCol === 1
            && Math.floor(scrollTop / this.scrollHeight * itemCount) + itemsPerRowByCalc >= itemCount) {
            itemsPerRow = itemsPerRowByCalc;
        }

        return {
            itemCount: itemCount,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
            childWidth: childWidth,
            childHeight: childHeight,
            itemsPerRow: itemsPerRow,
            itemsPerCol: itemsPerCol,
            itemsPerRowByCalc: itemsPerRowByCalc,
        };
    }

    private _calculateItems() {
        const el = this._getScrollElement();
        const d = this._calculateDimensions();
        const items = this.items || [];
        const offsetTop = this._getElementsOffset();
        let elScrollTop = this.parentScroll instanceof Window
            ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
            : el.scrollTop;
        this.scrollHeight = d.childHeight * d.itemCount / d.itemsPerRow;
        if (elScrollTop > this.scrollHeight) {
            elScrollTop = this.scrollHeight + offsetTop;
        }

        const scrollTop = Math.max(0, elScrollTop - offsetTop);
        const indexByScrollTop = scrollTop / this.scrollHeight * d.itemCount / d.itemsPerRow;
        let end = Math.min(d.itemCount,
            Math.ceil(indexByScrollTop) * d.itemsPerRow + d.itemsPerRow * (d.itemsPerCol + 1));

        let maxStartEnd = end;
        const modEnd = end % d.itemsPerRow;
        if (modEnd) {
            maxStartEnd = end + d.itemsPerRow - modEnd;
        }
        const maxStart = Math.max(0, maxStartEnd - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
        let start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);

        this.topPadding = d.childHeight * Math.ceil(start / d.itemsPerRow)
            - (d.childHeight * Math.min(start, this.bufferAmount));

        start = !isNaN(start) ? start : -1;
        end = !isNaN(end) ? end : -1;
        start -= this.bufferAmount;
        start = Math.max(0, start);
        end += this.bufferAmount;
        end = Math.min(items.length, end);
        if (start !== this.previousStart || end !== this.previousEnd) {

            // update the scroll list
            this.viewPortItems = items.slice(start, end);
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

        } else if (this.startupLoop === true) {
            this.startupLoop = false;
            this.refresh();
        }
    }
}
