import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { AuthService } from "app/services";
import { autobind } from "@batch-flask/core";
import { ExternalBrowserAuthToggleComponent } from "..";

@Component({
    selector: "be-auth-overlay",
    templateUrl: "auth-overlay.html",
})
export class AuthOverlayComponent implements OnInit {
    public tenantName: string;
    @Input() public tenantId: string;
    @Input() public requestId: string;

    @ViewChild("authToggle")
    private authToggleComponent: ExternalBrowserAuthToggleComponent;

    constructor(private authService: AuthService) {}

    public async ngOnInit() {
        if (this.tenantId === "organizations") {
            this.tenantName = "Azure";
        } else {
            this.authService.tenants.subscribe((tenants) => {
                const tenant = tenants.find(x => x.tenantId === this.tenantId);
                if (tenant) {
                    this.tenantName = tenant.displayName;
                } else {
                    this.tenantName = this.tenantId;
                }
            });
        }
    }

    @autobind()
    public async selectAuth() {
        this.sendResponse("success");
    }

    @autobind()
    public async cancel() {
        this.sendResponse("cancel");
    }

    private sendResponse(result: "success" | "cancel") {
        this.authService.authSelectResult({
            result,
            requestId: this.requestId,
            externalBrowserAuth: this.authToggleComponent.externalBrowserAuth,
        });
    }
}
