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
import { DialogService } from "@batch-flask/ui";
import { ConnectionType, Node, NodeConnectionSettings } from "app/models";
import { NodeConnectService, SSHKeyService } from "app/services";
import { BEUserConfiguration } from "common";
import { Duration } from "luxon";
import { SSHKeyPickerDialogComponent } from "../ssh-key-picker-dialog";

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

    public get sshCommand() {
        if (!this.connectionSettings) {
            return "N/A";
        }
        const { ip, port } = this.connectionSettings;

        return `ssh ${this.userConfig.name}@${ip} -p ${port}`;
    }
    // inherited input properties
    @Input() public connectionSettings: NodeConnectionSettings;
    @Input() public node: Node;
    @Input() public userConfig: UserConfiguration;
    @Input() public passwordCopied: boolean;
    @Input() public generatePassword: () => void;
    @Output() public userConfigChange = new EventEmitter<UserConfiguration>();
    @Output() public passwordCopiedChange = new EventEmitter<boolean>();

    public isLinux: boolean;
    public otherStrategy: string;
    public homeKey: string | null = null;
    public passwordVisible: boolean;
    public passwordCopyText: string;
    public regeneratingPassword: boolean;

    public PORT_NOT_SPECIFIED: string = "(Not Specified)";

    constructor(
        private nodeConnectService: NodeConnectService,
        private sshKeyService: SSHKeyService,
        private shell: ElectronShell,
        private settingsService: UserConfigurationService<BEUserConfiguration>,
        private dialogService: DialogService,
        private changeDetector: ChangeDetectorRef,
    ) { }

    public ngOnInit() {
        this.passwordVisible = false;
        this.passwordCopyText = CopyText.BeforeCopy;
        this.regeneratingPassword = false;

        this.isLinux = this.connectionSettings.type === ConnectionType.SSH;
        this.otherStrategy = this.userConfig.usingSSHKey ? AuthStrategies.Password : AuthStrategies.Keys;

        this.nodeConnectService.getPublicKey(this.sshKeyService.homePublicKeyPath).subscribe({
            next: (key) => {
                this.homeKey = key;
                this.changeDetector.markForCheck();
            },
            error: () => {
                this.homeKey = null;
                this.changeDetector.markForCheck();
            },
        });
    }

    public ngOnChanges(changes) {
        if (changes.passwordCopied) {
            this.passwordCopyText = changes.passwordCopied.currentValue ? CopyText.AfterCopy : CopyText.BeforeCopy;
        }
    }

    @autobind()
    public setUsername(event) {
        const newName = event.target.value.replace(/ /g, "");
        this.userConfig.name = newName || this.settingsService.current.nodeConnect.defaultUsername;
        this._emitChanges();

    }

    @autobind()
    public setPassword(event) {
        // set the passwordCopied binding to be false, to reconvert the passwordCopyText
        this.passwordCopied = false;
        this.passwordCopiedChange.emit(this.passwordCopied);

        // set the password itself in the credentials binding
        this.userConfig.password = event.target.value;
        this._emitChanges();
    }

    public updateIsAdmin(value: boolean) {
        this.userConfig.isAdmin = value;
        this._emitChanges();

    }

    public updateExpireIn(value: Duration) {
        this.userConfig.expireIn = value;
        this._emitChanges();
    }

    @autobind()
    public regeneratePassword() {
        if (this.regeneratingPassword) { return; }

        this.regeneratingPassword = true;
        this.changeDetector.markForCheck();

        setTimeout(() => {
            this.generatePassword();
            this.regeneratingPassword = false;
            this.changeDetector.markForCheck();
        }, 500);
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
        this._emitChanges();
        if (this.otherStrategy === AuthStrategies.Keys) {
            this.otherStrategy = AuthStrategies.Password;
        } else {
            this.otherStrategy = AuthStrategies.Keys;
        }
    }

    @autobind()
    public togglePasswordVisible() {
        this.passwordVisible = !this.passwordVisible;
        this.changeDetector.markForCheck();
    }

    public pickSSHPublicKey() {
        const ref = this.dialogService.open(SSHKeyPickerDialogComponent);
        ref.componentInstance.sshPublicKey.setValue(this.userConfig.sshPublicKey);
        ref.afterClosed().subscribe((key) => {
            this.userConfig.sshPublicKey = key;
            this._emitChanges();
        });
    }

    private _emitChanges() {
        this.changeDetector.markForCheck();
        this.userConfigChange.emit(this.userConfig);
    }
}
