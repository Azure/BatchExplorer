import { Component, Input, OnChanges } from "@angular/core";
import { I18N_NAMESPACE } from "@batch-flask/ui";
import { Node, Pool } from "app/models";
import { NodeDecorator } from "app/models/decorators";
import { NodeConnectService } from "app/services";
import { PoolUtils } from "app/utils";

@Component({
    selector: "bl-node-configuration",
    templateUrl: "node-configuration.html",
    providers: [
        { provide: I18N_NAMESPACE, useValue: "node-configuration" },
    ],
})
export class NodeConfigurationComponent implements OnChanges {
    @Input()
    public pool: Pool;

    @Input()
    public set node(value: Node) {
        this._node = value;
        this.decorator = new NodeDecorator(this._node);
    }
    public get node() { return this._node; }

    public decorator: NodeDecorator;
    public externalIpAddress;

    private _node: Node;

    constructor(private nodeConnectService: NodeConnectService) { }

    public ngOnChanges(inputs) {
        if (inputs.node && inputs.pool) {
            if (PoolUtils.isIaas(this.pool)) {
                this.externalIpAddress = "Loading...";
                this.nodeConnectService.getConnectionSettings(this.pool, this.node).subscribe({
                    next: (settings) => {
                        this.externalIpAddress = settings.ip;
                    },
                    error: (error) => {
                        this.externalIpAddress = "Error occured retrieving public IP Address";
                    },
                });
            } else {
                this.externalIpAddress = null;
            }
        }
    }
}
