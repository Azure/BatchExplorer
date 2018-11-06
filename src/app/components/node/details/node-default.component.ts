import { Component } from "@angular/core";

@Component({
    selector: "bl-no-node-selected",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a node from the list</p>
        </div>
    `,
})
export class NodeDefaultComponent {
    public static breadcrumb(params, queryParams) {
        return { name: "Nodes" };
    }
}
