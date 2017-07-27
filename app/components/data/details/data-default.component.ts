import { Component } from "@angular/core";
@Component({
    selector: "bl-application-default",
    template: `
        <bl-cloud-file-picker fileGroup="fgrp-blender-data" label="Scene file"></bl-cloud-file-picker>
        <bl-storage-error-display></bl-storage-error-display>
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
