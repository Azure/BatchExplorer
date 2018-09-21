import { Injectable } from "@angular/core";
import { I18nService } from "@batch-flask/core";
import { Constants } from "common";
import { MenuItemConstructorOptions, shell } from "electron";

@Injectable()
export class HelpMenu {
    constructor(private i18n: I18nService) {

    }
    public getElectronMenu(): MenuItemConstructorOptions {
        return {
            label: this.i18n.translate("main-menu.help.label"),
            submenu: [
                {
                    label: this.i18n.translate("main-menu.help.viewLicense"),
                    click: () => this.openLicense(),
                },
                {
                    label: this.i18n.translate("main-menu.help.privacyStatement"),
                    click: () => this.openPrivacyStatement(),
                },
                { type: "separator" },
                {
                    label: this.i18n.translate("main-menu.help.reportIssue"),
                    click: () => this.submitIssue(),
                },
            ],
        };
    }

    public openLicense() {
        shell.openExternal(Constants.ExternalLinks.license);
    }

    public openPrivacyStatement() {
        shell.openExternal(Constants.ExternalLinks.privacyStatement);
    }

    public submitIssue() {
        shell.openExternal(Constants.ExternalLinks.submitIssue);
    }
}
