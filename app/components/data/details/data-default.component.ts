import { Component } from "@angular/core";
import { ArmResourceUtils } from "app/utils";
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
    public static breadcrumb(params) {
        if (params["dataSource"] === "file-groups") {
            return { name: "File groups" };
        }
        const name = ArmResourceUtils.getAccountNameFromResourceId(params["dataSource"]);
        return { name };
    }
}
