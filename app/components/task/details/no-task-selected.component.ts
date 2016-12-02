import { Component } from "@angular/core";

@Component({
    selector: "bex-no-task-selected",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a task from the list</p>
        </div>
    `,
})
export class NoTaskSelectedComponent {
}
