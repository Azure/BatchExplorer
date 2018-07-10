import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { Node, NodeConnectionSettings } from "app/models";
import { NodeConnectService } from "app/services";

import "./node-property-display.scss";

@Component({
    selector: "bl-node-property-display",
    templateUrl: "node-property-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePropertyDisplayComponent implements OnInit {

    // inherited input properties
    @Input() public connectionSettings: NodeConnectionSettings;
    @Input() public rdpContent: string;
    @Input() public node: Node;
    @Input() public linux: boolean;

    // other instance
    public ipFromRdp: string;
    public publicKeyFile: string;

    constructor(
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
    ) {}

    public ngOnInit() {
        if (this.rdpContent) {
            this.ipFromRdp = this.rdpContent.match(/[0-9.]{7,}/)[0];
        }
        this.publicKeyFile = this.nodeConnectService.publicKeyFile;
    }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.username}@${ip} -p ${port}`;
    }

    public get username() {
        return this.nodeConnectService.username;
    }

    public setUsername(event) {
        this.nodeConnectService.username = event.target.value;
    }

    public get password() {
        return this.nodeConnectService.password;
    }

    @autobind()
    public downloadRdp() {
        const obs = this.nodeConnectService.saveRdpFile(this.rdpContent, this.connectionSettings, this.node.id);
        obs.subscribe({
            next: (filename) => {
                this.shell.showItemInFolder(filename);
            },
        });
        return obs;
    }
}
