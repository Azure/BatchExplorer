import { Component } from "@angular/core";
import "./parameter-input.scss";

@Component({
    selector: "bl-parameter-input",
    templateUrl: "parameter-input.html",
})
export class ParameterInputComponent {
    public static breadcrumb() {
        return { name: "Parameter Input" };
    }
    constructor() {
        console.log("hello world");
    }
}
