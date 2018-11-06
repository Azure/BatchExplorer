import { Component } from "@angular/core";

@Component({
    selector: "bl-application-default",
    template: `
        <bl-application-error-display></bl-application-error-display>
        <div class="no-entity-home">
            <i class="fa fa-file-archive-o large"></i>
            <p>Please select an application from the list</p>
        </div>
    `,
})

export class ApplicationDefaultComponent {
    public static breadcrumb() {
        return { name: "Applications" };
    }
}
