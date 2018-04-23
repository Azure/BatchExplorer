import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./vtab.scss";

@Component({
    selector: "bl-vtab",
    templateUrl: "vtab.html",
})
export class VTabComponent {
    @Input() public id: string;

    @ViewChild("label")
    public label: TemplateRef<any>;

    @ViewChild("content")
    public content: TemplateRef<any>;
}
