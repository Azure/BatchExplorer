# Virtual scroll component


## Usage

```html
<bl-virtual-scroll
    [items]="items"
    [childHeight]="48"
    (update)="updateViewPortItems($event)">

    <div *ngFor="let item of viewPortItems; trackBy: trackItem">
        <!-- Displpay item here -->
    </div>

    <!-- Optional adding a tail. -->
    <bl-virtual-scroll-tail [height]="100" *ngIf="showTail">
       <!-- THings to show at the end of the scrolling -->
    </bl-virtual-scroll-tail>
</bl-virtual-scroll>
```

In your component

```ts

@Component( {
  ...
})
export class MyComponent {
    public viewPortItems: any[];

    public updateViewPortItems(items: any) {
        this.items = this.viewPortItems();
        this.changeDetector.markForCheck();
    }
}

```
