import { Component, OnInit } from "@angular/core";
import { UserConfigurationService, autobind } from "@batch-flask/core";
import { BEUserConfiguration } from "common";

@Component({
    selector: "be-external-browser-auth-toggle",
    templateUrl: "external-browser-auth-toggle.html",
})
export class ExternalBrowserAuthToggleComponent implements OnInit {
    public externalBrowserAuth = false;

    constructor(
        public userConfigService: UserConfigurationService<BEUserConfiguration>
    ) {}

    public async ngOnInit() {
        this.externalBrowserAuth =
            await this.userConfigService.get("externalBrowserAuth");
    }

    @autobind()
    public async toggleExternalBrowserAuth(value: boolean) {
        await this.userConfigService.set("externalBrowserAuth", value);
        this.externalBrowserAuth = value;
    }
}
