import { OS } from "@batch-flask/utils";

let bindings: KeyBindings[];

// TODO move to a JSON file
if (OS.isOSX()) {
    bindings = [
        {
            key: "command+shift+o",
            command: "open-add-pool",
        },
    ];
} else {
    bindings = [
        {
            key: "ctrl+shift+o",
            command: "open-add-pool",
        },
    ];
}

export const defaultKeybindings = bindings;

export interface KeyBindings {
    key: string;
    command: string;
    when?: string;
}
