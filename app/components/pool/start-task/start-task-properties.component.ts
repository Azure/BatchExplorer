import { Component, Input } from "@angular/core";

import { Pool, StartTask } from "app/models";

@Component({
    selector: "bl-start-task-properties",
    templateUrl: "start-task-properties.html",
})
export class StartTaskPropertiesComponent {
    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        this.startTask = pool.startTask;
    }
    public get pool() { return this._pool; }

    public startTask: StartTask;
    public edit = false;

    private _pool: Pool;

}
