import { Component } from "@angular/core";

@Component({
    selector: "bex-no-node-selected",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a node from the list</p>
        </div>
    `,
})
export class NoNodeSelectedComponent {
    public static breadcrumb(params, queryParams) {
        return { name: "Nodes" };
    }
}
