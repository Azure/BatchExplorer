import { Component } from "@angular/core";

@Component({
    selector: "bl-pool-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a pool from the list</p>
        </div>
    `,
})

export class PoolDetailsHomeComponent {
    public static breadcrumb() {
        return { name: "Pools" };
    }
}
