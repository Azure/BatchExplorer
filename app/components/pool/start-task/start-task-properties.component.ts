import { Component, Input } from "@angular/core";
import { autobind } from "core-decorators";

import { SidebarManager } from "app/components/base/sidebar";
import { Pool, StartTask } from "app/models";
import { StartTaskDecorator } from "app/models/decorators";
import { StartTaskEditFormComponent } from "./start-task-edit-form.component";

@Component({
    selector: "bl-start-task-properties",
    templateUrl: "start-task-properties.html",
})
export class StartTaskPropertiesComponent {
    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        this.startTask = pool.startTask;
        if (pool.startTask) {
            this.decorator = new StartTaskDecorator(pool.startTask);
        }
    }
    public get pool() { return this._pool; }

    public startTask: StartTask;
    public decorator: StartTaskDecorator;
    private _pool: Pool;

    constructor(private sidebarManager: SidebarManager) { }

    @autobind()
    public edit() {
        const ref = this.sidebarManager.open(`edit-start-task-${this._pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
    }

}
