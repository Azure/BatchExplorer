import { Component } from "@angular/core";

@Component({
    selector: "bex-application-default",
    template: `
        <bex-application-error-display></bex-application-error-display>
        <div class="no-entity-home">
            <i class="fa fa-cogs"></i>
            <p>Please select an application from the list</p>
        </div>
    `,
})

export class ApplicationDefaultComponent {
    public static breadcrumb() {
        return { name: "Applications" };
    }
}
