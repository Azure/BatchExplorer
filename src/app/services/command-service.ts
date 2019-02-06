import { Injectable, NgZone } from "@angular/core";
import * as MouseTrap from "mousetrap";

// import * as CommandMap from "app/commands";
import { CommandBase } from "app/commands/core";
import { KeyBindings } from "app/models";

// export const commands: any[] = ObjectUtils.values(CommandMap as any).filter((x: any) => x.id !== undefined);

@Injectable({providedIn: "root"})
export class CommandService {
    private _commandMap: { [key: string]: CommandBase } = {};
    private _setOnce = false;

    constructor(private zone: NgZone) {

    }

    public init() {
        // for(const key of Object.keys(CommandMap)) {
        //     const command = CommandMap[key];
        //     if (command.id) {
        //         this._commandMap[command.id] = this.injector.get(command);
        //     }
        // }
    }

    public perform(action: string) {
        const command = this._commandMap[action];
        if (!command) {
            return;
        }

        command.execute();
    }

    public registerShortcuts(keybindings: KeyBindings[]) {
        if (this._setOnce) {
            MouseTrap.reset();
        }
        this._setOnce = true;
        for (const shortcut of keybindings) {
            if (!shortcut.key) { continue; }
            MouseTrap.bind(shortcut.key, () => {
                this.zone.run(() => {
                    this.perform(shortcut.command);
                });
            });
        }
    }
}
