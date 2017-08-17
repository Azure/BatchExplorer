import { Component, Input } from "@angular/core";
import { NcjJobTemplate, NcjParameter, NcjPoolTemplate } from "app/models";
import "./parameter-input.scss";

@Component({
    selector: "bl-parameter-input",
    templateUrl: "parameter-input.html",
})
export class ParameterInputComponent {
    public static breadcrumb() {
        return { name: "Parameter Input" };
    }

    @Input()
    public parameter: NcjParameter;

    @Input()
    public type;

    constructor() {
        console.log(this.parameter, this.type);
    }

    public printTypes(){
        console.log(this.type);
    }
}
