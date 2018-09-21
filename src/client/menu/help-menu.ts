import { Injectable } from "@angular/core";
import { Constants } from "common";
import { MenuItemConstructorOptions, shell } from "electron";

@Injectable()
export class HelpMenu {
    public label = "Help";

    public getElectronMenu(): MenuItemConstructorOptions {
        return {
            label: this.label,
            submenu: [
                {
                    label: "View license",
                    click: () => this.openLicense(),
                },
                {
                    label: "Privacy statement",
                    click: () => this.openPrivacyStatement(),
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
}
