import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ElectronShell } from "@batch-flask/electron";
import { DialogService } from "@batch-flask/ui/dialogs";

import { CredentialType, ProgramaticUsageComponent } from "../programatic-usage";
import "./getting-started-card.scss";

@Component({
    selector: "bl-getting-started-card",
    templateUrl: "getting-started-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedCardComponent {
    public CredentialType = CredentialType;

    @Input() public accountId: string;

    constructor(private shell: ElectronShell, private dialogService: DialogService) {

    }

    public openPage(src: string, credType: CredentialType) {
        const ref = this.dialogService.open(ProgramaticUsageComponent);
        ref.componentInstance.accountId = this.accountId;
        ref.componentInstance.pickCredentialType(credType);
        ref.componentInstance.pickType(src);
    }

    public gotoAztkDoc() {
        this.shell.openExternal("https://github.com/Azure/aztk");
    }

    public gotoDoAzureParallelDoc() {
        this.shell.openExternal("https://github.com/Azure/doAzureParallel");
    }
}
