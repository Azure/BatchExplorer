import { Component } from "@angular/core";
import * as React from "react";

import "./playground-route.scss";

import { PlaygroundExample, PlaygroundExampleProps } from "@batch/ui-playground";
@Component({
    selector: "bl-theme-colors",
    templateUrl: "playground-route.html",
})
export class PlaygroundRouteComponent  {

    public static breadcrumb() {
        return { name: "Playground" };
    }


    public PlaygroundExample: React.FC<PlaygroundExampleProps>;
    public PlaygroundExampleProps: PlaygroundExampleProps;

    constructor() {
        this.PlaygroundExample = PlaygroundExample;
        this.PlaygroundExampleProps = {};

    }


}
