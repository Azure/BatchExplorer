# Context menu

You can add a context menu on right click(or any other trigger if needed).


Example of usage.
```typescript

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";

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

In the template
```html
    <bl-quick-list [commands]="commands">
        <bl-quick-list-item *ngFor="let item of items"></bl-quick-list-item>
    </bl-quick-list>
```

In the model
```typescript
    constructor(injectorFactory: InjectorFactory) {
        this.commands = injectorFactory.create(JobCommands);
    }
```

In `job-commands.ts`
```ts
    export class JobCommands {
        public edit: EntityCommand<Job, void>;
        public delete: EntityCommand<Job, void>;
        public enable: EntityCommand<Job, void>;

        constructor(private jobService: JobService) {
            this.edit = this.simpleCommand({
                label: "Edit",
                action: (job) => this._editJob(job),
                enabled: (job) => job.state !== JobState.completed,
                multiple: false,
                confirm: false,
                notify: false,
            });
            this.delete = this.simpleCommand({
                label: "Delete",
                action: (job: Job) => this.jobService.delete(job.id),
            });
            this.enable = this.simpleCommand({
                label: "Enable",
                action: (job: Job) => this.jobService.enable(job.id),
            });

            this.commands = [
                this.edit,
                this.delete,
                this.enable,
            ]
        }


        public get(jobId: string) {
            return this.jobService.get(jobId);
        }

        public getFromCache(jobId: string) {
            return this.jobService.getFromCache(jobId);
        }
    }
```
