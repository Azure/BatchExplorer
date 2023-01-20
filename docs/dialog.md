# How to open a popup dialog

You can open a popup dialog in Batch Explorer to ask for confirmation to the user, fill a small form, etc.

First you need to import the `DialogService`

```ts
import { DialogService } from "@batch-flask/ui/dialogs";

constructor(private dialog: DialogService) {}
```

## Common dialogs

### 1. Confirmation dialog

Simplest confirmation dialog that do some action when user confirm.

```ts
this.dialog.confirm("Are you sure?", {
    yes: () => this.otherService.doSomething(),
})
```

You can also have a description to detail a bit more what the user is about to confirm

```ts
this.dialog.confirm("Are you sure?", {
    description: "This cannot be reverted.",
    yes: () => this.otherService.doSomething(),
})
```

## Custom dialogs

You can also open any component as a dialog. For that you'll need to first add the component to the entryComponents list of the module

```ts
@NgModule({
    ...
    entryComponents: [
        MyDialogComponent
    ],
    ...
})
```

then just call open(Note that this is just a proxy function to material MatDialog open)

```ts
const ref = this.dialog.open(MyDialogComponent);
reg.componentInstance # If you want to set some variables.
```
