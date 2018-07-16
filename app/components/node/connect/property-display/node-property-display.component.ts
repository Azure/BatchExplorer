import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/ui";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { AddNodeUserAttributes, NodeConnectService, SettingsService } from "app/services";

import "./node-property-display.scss";

const AUTH_STRATEGIES = {
    Keys: "Keys",
    Password: "Password",
};

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
    @Input() public usingSSHKeys: boolean;
    @Output() public credentialsChange = new EventEmitter<AddNodeUserAttributes>();
    @Output() public usingSSHKeysChange = new EventEmitter<boolean>();

    public isLinux: boolean;
    public otherStrategy: string;
    public hasPublicKey: boolean;

    public PORT_NOT_SPECIFIED: string = "(Not Specified)";

    constructor(
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
        private settingsService: SettingsService,
        private changeDetector: ChangeDetectorRef,
    ) {}

    public ngOnInit() {
        this.isLinux = this.connectionSettings.type === ConnectionType.SSH;
        this.otherStrategy = this.usingSSHKeys ? AUTH_STRATEGIES.Password : AUTH_STRATEGIES.Keys;

        this.nodeConnectService.getPublicKey(this.publicKeyFile).subscribe({
            next: (key) => {
                this.hasPublicKey = Boolean(key);
                this.changeDetector.markForCheck();
            },
            error: (err) => {
                this.hasPublicKey = false;
                this.changeDetector.markForCheck();
            },
        });
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

    @autobind()
    public switchAuthStrategy() {
        this.usingSSHKeys = !this.usingSSHKeys;
        this.usingSSHKeysChange.emit(this.usingSSHKeys);
        if (this.otherStrategy === AUTH_STRATEGIES.Keys) {
            this.otherStrategy = AUTH_STRATEGIES.Password;
         } else {
            this.otherStrategy = AUTH_STRATEGIES.Keys;
         }
        this.changeDetector.markForCheck();
    }
}
