import { Component } from "@angular/core";
@Component({
    selector: "bl-application-default",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-cloud-upload large"></i>
            <p>Please select a file group from the list</p>
        </div>
    `,
})

export class DataDefaultComponent {
    public static breadcrumb() {
        return { name: "File groups" };
    }
}
