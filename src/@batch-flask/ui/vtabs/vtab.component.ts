import { Component, TemplateRef, ViewChild } from "@angular/core";

import "./vtab.scss";

@Component({
    selector: "bl-vtab",
    templateUrl: "vtab.html",
})
export class VTabComponent {
    @ViewChild("label")
    public label: TemplateRef<any>;

    @ViewChild("content")
    public content: TemplateRef<any>;

    public id: string;
}
