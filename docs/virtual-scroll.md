# Virtual scroll component

When working with large set of data displaying a long list in html can be quite laggy.
Virtual scrolling means you only write to the dom the elements that are currently in the view.

This has however some restrictions:

* You must know the height of your items. TThis is used to caclulate where you are in the list
* Each item mush have the exact same height
* The container of the virtual scroll must have a fixed height(Or 100%). Virtual scroll will try to use all the space available to it

Virtual scroll is currently being used in the `bl-quick-list` and `bl-table` components for examples.

## Usage

```html
<bl-virtual-scroll
    [items]="items"
    [childHeight]="48">

    <div *ngVirtualRow="let item; trackBy: trackItem">
        <!-- Displpay item here -->
    </div>

    <!-- Optional adding a tail. -->
    <bl-virtual-scroll-tail [height]="100" *ngIf="showTail">
       <!-- THings to show at the end of the scrolling -->
    </bl-virtual-scroll-tail>
</bl-virtual-scroll>
```
