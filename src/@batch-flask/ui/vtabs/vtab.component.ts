import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./vtab.scss";

@Component({
    selector: "bl-vtab",
    templateUrl: "vtab.html",
})
export class VTabComponent {
    @Input() public id: string;

    @ViewChild("label", { static: true })
    public label: TemplateRef<any>;

    @ViewChild("content", { static: true })
    public content: TemplateRef<any>;
}
