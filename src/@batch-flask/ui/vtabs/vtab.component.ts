import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./vtab.scss";

@Component({
    selector: "bl-vtab",
    templateUrl: "vtab.html",
})
export class VTabComponent {
    @Input() public id: string;

    @ViewChild("label", { static: false })
    public label: TemplateRef<any>;

    @ViewChild("content", { static: false })
    public content: TemplateRef<any>;
}
