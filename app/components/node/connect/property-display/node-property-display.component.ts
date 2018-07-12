import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { AddNodeUserAttributes, NodeConnectService, SettingsService } from "app/services";

import "./node-property-display.scss";

@Component({
    selector: "bl-node-property-display",
    templateUrl: "node-property-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePropertyDisplayComponent implements OnInit {

    // inherited input properties
    @Input() public connectionSettings: NodeConnectionSettings;
    @Input() public node: Node;
    @Input() public credentials: AddNodeUserAttributes;
    @Input() public publicKeyFile: string;
    @Output() public credentialsChange = new EventEmitter<AddNodeUserAttributes>();

    // other instance
    public usingSSH;

    constructor(
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
        private settingsService: SettingsService,
    ) {}

    public ngOnInit() {
        this.usingSSH = this.connectionSettings.type === ConnectionType.SSH;
    }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.credentials.name}@${ip} -p ${port}`;
    }

    @autobind()
    public setUsername(event) {
        // TODO-Adam reimplement as a FormControl with custom validator
        const newName = event.target.value.replace(/ /g, "");
        this.credentials.name = newName || this.settingsService.settings["node-connect.default-username"];
        this.credentialsChange.emit(this.credentials);
    }

    @autobind()
    public setPassword(event) {
        this.credentials.password = event.target.value;
        this.credentialsChange.emit(this.credentials);
    }

    @autobind()
    public downloadRdp() {
        const obs = this.nodeConnectService.saveRdpFile(this.connectionSettings, this.credentials, this.node.id);
        obs.subscribe({
            next: (filename) => {
                this.shell.showItemInFolder(filename);
            },
        });
        return obs;
    }
}
