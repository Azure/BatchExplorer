import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
} from "@angular/core";
import { UserConfigurationService, autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { NodeConnectService } from "app/services";
import { BEUserConfiguration } from "common";
import { Duration } from "luxon";

import "./node-property-display.scss";

enum AuthStrategies {
    Keys = "Keys",
    Password = "Password",
}

enum CopyText {
    BeforeCopy = "Password will be copied to clipboard on Connect",
    AfterCopy = "Password copied to clipboard!",
}

export interface UserConfiguration {
    name: string;
    isAdmin: boolean;
    expireIn: Duration;
    password?: string;
    sshPublicKey?: string;
    usingSSHKey?: boolean;
}

@Component({
    selector: "bl-node-property-display",
    templateUrl: "node-property-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePropertyDisplayComponent implements OnInit, OnChanges {
    // inherited input properties
    @Input() public connectionSettings: NodeConnectionSettings;
    @Input() public node: Node;
    @Input() public userConfig: UserConfiguration;
    @Input() public publicKeyFile: string;
    @Input() public passwordCopied: boolean;
    @Input() public generatePassword: () => void;
    @Output() public userConfigChange = new EventEmitter<UserConfiguration>();
    @Output() public passwordCopiedChange = new EventEmitter<boolean>();

    public isLinux: boolean;
    public otherStrategy: string;
    public hasPublicKey: boolean;
    public passwordVisible: boolean;
    public passwordCopyText: string;
    public regeneratingPassword: boolean;

    public PORT_NOT_SPECIFIED: string = "(Not Specified)";

    constructor(
        private nodeConnectService: NodeConnectService,
        private shell: ElectronShell,
        private settingsService: UserConfigurationService<BEUserConfiguration>,
        private changeDetector: ChangeDetectorRef,
    ) {}

    public ngOnInit() {
        this.passwordVisible = false;
        this.passwordCopyText = CopyText.BeforeCopy;
        this.regeneratingPassword = false;

        this.isLinux = this.connectionSettings.type === ConnectionType.SSH;
        this.otherStrategy = this.userConfig.usingSSHKey ? AuthStrategies.Password : AuthStrategies.Keys;

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

    public ngOnChanges(changes) {
        if (changes.passwordCopied) {
            this.passwordCopyText = changes.passwordCopied.currentValue ? CopyText.AfterCopy : CopyText.BeforeCopy;
        }
    }

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.userConfig.name}@${ip} -p ${port}`;
    }

    @autobind()
    public setUsername(event) {
        // TODO-Adam reimplement as a FormControl with custom validator
        const newName = event.target.value.replace(/ /g, "");
        this.userConfig.name = newName || this.settingsService.current.nodeConnect.defaultUsername;
        this.userConfigChange.emit(this.userConfig);
    }

    @autobind()
    public setPassword(event) {
        // set the passwordCopied binding to be false, to reconvert the passwordCopyText
        this.passwordCopied = false;
        this.passwordCopiedChange.emit(this.passwordCopied);

        // set the password itself in the credentials binding
        this.userConfig.password = event.target.value;
        this.userConfigChange.emit(this.userConfig);
    }

    public updateIsAdmin(value: boolean) {
        this.userConfig.isAdmin = value;
        this.changeDetector.markForCheck();
        this.userConfigChange.emit(this.userConfig);
    }
    
    public updateExpireIn(value: Duration) {
        this.userConfig.expireIn = value;
        this.changeDetector.markForCheck();
        this.userConfigChange.emit(this.userConfig);
    }

    @autobind()
    public regeneratePassword() {
        if (this.regeneratingPassword) { return; }

        setTimeout(() => {
            this.generatePassword();
            this.regeneratingPassword = false;
            this.changeDetector.markForCheck();
        }, 500);

        this.regeneratingPassword = true;
        this.changeDetector.markForCheck();
    }

    @autobind()
    public downloadRdp() {
        const obs = this.nodeConnectService.saveRdpFile(this.connectionSettings, this.userConfig, this.node.id);
        obs.subscribe({
            next: (filename) => {
                this.shell.showItemInFolder(filename);
            },
        });
        return obs;
    }

    @autobind()
    public switchAuthStrategy() {
        this.userConfig.usingSSHKey = !this.userConfig.usingSSHKey;
        this.userConfigChange.emit( this.userConfig);
        if (this.otherStrategy === AuthStrategies.Keys) {
            this.otherStrategy = AuthStrategies.Password;
         } else {
            this.otherStrategy = AuthStrategies.Keys;
         }
        this.changeDetector.markForCheck();
    }

    @autobind()
    public togglePasswordVisible() {
        this.passwordVisible = !this.passwordVisible;
    }
}
