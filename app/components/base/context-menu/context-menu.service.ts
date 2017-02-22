import { Injectable, NgZone } from "@angular/core";
import { remote } from "electron";
const { Menu, MenuItem } = remote;

import { ContextMenu } from "./context-menu.model";

@Injectable()
export class ContextMenuService {
    constructor(private zone: NgZone) { }

    public openMenu(menu: ContextMenu) {
        const electronMenu = this._buildElectronMenu(menu);
        electronMenu.popup(remote.getCurrentWindow());
    }

    private _buildElectronMenu(menu: ContextMenu): Electron.Menu {
        const electronMenu = new Menu();
        for (let item of menu.items) {
            electronMenu.append(new MenuItem({
                label: item.label,
                click: () => {
                    this.zone.run(() => item.click());
                },
                enabled: item.enabled,
            }));
        }
        return electronMenu;
    }
}
