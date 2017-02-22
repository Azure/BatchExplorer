# Context menu

You can add a context menu on right click(or any other trigger if needed).


Example of usage.
```typescript

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";

@Component({
    template: `<div (contextmenu)="onContextMenu()"></div>`
})
export class MyComponent {
    constructor(private contextMenuService: ContextMenuService) {}

    public onContextMenu() {
        contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Delete", () => console.log("Delete")),
            new ContextMenuItem("Terminate", () => console.log("Terminate")),
            new ContextMenuItem({label: "Enable", click: () => console.log("Enable"), enable: false}),
        ]));
    }
}
```

## Context menu in quick list or table.

Table and quicklist support the context menu you just have to pass the menu as input to the quick list item/row.

```html
    <bex-quick-list>
    <bex-quick-list-item *ngFor="let item of items" [contextmenu]="contextmenu(item)"></bex-quick-list-item>
    </bex-quick-list>
```


```typescript
    public contextmenu(item) {
       new ContextMenu([
            new ContextMenuItem("Delete", () => console.log("Delete", item)),
            new ContextMenuItem("Terminate", () => console.log("Terminate", item)),
            new ContextMenuItem({label: "Enable", click: () => console.log("Enable", item), enable: false}),
        ]);
    }
```
