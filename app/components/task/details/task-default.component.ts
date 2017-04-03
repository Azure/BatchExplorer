import { Component } from "@angular/core";

@Component({
    selector: "bl-no-task-selected",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a task from the list</p>
        </div>
    `,
})
export class TaskDefaultComponent {
    public static breadcrumb(params, queryParams) {
        return { name: "Tasks" };
    }
}
