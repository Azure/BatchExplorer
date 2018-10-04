import { Injectable, NgZone } from "@angular/core";
import { ElectronRemote } from "@batch-flask/electron";
import {
    ContextMenu,
    ContextMenuEntry,
    ContextMenuItem,
    ContextMenuSeparator,
    MultiContextMenuItem,
} from "./context-menu.model";

@Injectable()
export class ContextMenuService {
    constructor(private zone: NgZone, private remote: ElectronRemote) {

    }

    public openMenu(menu: ContextMenu) {
        const electronMenu = this._buildElectronMenu(menu);
        electronMenu.popup(this.remote.getCurrentWindow());
    }

    private _buildElectronMenu(menu: ContextMenu): Electron.Menu {
        const electronMenu = new this.remote.Menu();
        for (const item of menu.items) {
            electronMenu.append(this._getElectronMenuItem(item));
        }
        return electronMenu;
    }

    private _getElectronMenuItem(item: ContextMenuEntry) {
        if (item instanceof ContextMenuItem) {
            return this._buildMenuItem(item);
        } else if (item instanceof MultiContextMenuItem) {
            return this._buildMutliMenuItem(item);
        } else if (item instanceof ContextMenuSeparator) {
            return new this.remote.MenuItem({
                type: "separator",
            });
        }
    }
    private _buildMenuItem(item: ContextMenuItem) {
        return new this.remote.MenuItem({
            label: item.label,
            click: () => {
                this.zone.run(() => item.click());
            },
            enabled: item.enabled,
            checked: item.checked,
            type: item.type,
        });
    }

    private _buildMutliMenuItem(item: MultiContextMenuItem) {
        return new this.remote.MenuItem({
            label: item.label,
            submenu: item.subitems.map(x => this._getElectronMenuItem(x)),
            enabled: item.enabled,
        });
    }
}
