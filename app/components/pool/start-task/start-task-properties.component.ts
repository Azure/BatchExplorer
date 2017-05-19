import { Component, Input } from "@angular/core";

import { Pool, StartTask } from "app/models";
import { StartTaskDecorator } from "app/models/decorators";

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
    public edit = false;

    private _pool: Pool;

}
