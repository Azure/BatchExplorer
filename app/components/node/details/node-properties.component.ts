import { Component, Input } from "@angular/core";

import { Node } from "app/models";
import { NodeDecorator } from "app/models/decorators";

@Component({
    selector: "bex-node-properties",
    templateUrl: "./node-properties.html",
})
export class NodePropertiesComponent {
    @Input()
    public set node(value: Node) {
        this._pool = value;
        this.decorator = new NodeDecorator(this._pool);
    }
    public get pool() { return this._pool; }

    public decorator: NodeDecorator;

    private _pool: Node;
}
