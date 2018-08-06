import { Injectable, NgZone } from "@angular/core";

import { ElectronRemote } from "@batch-flask/ui/electron";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator, MultiContextMenuItem } from "./context-menu.model";

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
            if (item instanceof ContextMenuItem) {
                electronMenu.append(this._buildMenuItem(item));
            } else if (item instanceof MultiContextMenuItem) {
                electronMenu.append(this._buildMutliMenuItem(item));
            } else if (item instanceof ContextMenuSeparator) {
                electronMenu.append(new this.remote.MenuItem({
                    type: "separator",
                }));
            }

        }
        return electronMenu;
    }

    private _buildMenuItem(item: ContextMenuItem) {
        return new this.remote.MenuItem({
            label: item.label,
            click: () => {
                this.zone.run(() => item.click());
            },
            enabled: item.enabled,
        });
    }

    private _buildMutliMenuItem(item: MultiContextMenuItem) {
        return new this.remote.MenuItem({
            label: item.label,
            submenu: item.subitems.map(x => this._buildMenuItem(x as any)) as any,
            enabled: item.enabled,
        });
    }
}
