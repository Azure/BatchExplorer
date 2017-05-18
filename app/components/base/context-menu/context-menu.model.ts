import { SecureUtils, exists } from "app/utils";

export class ContextMenu {
    public args: any[];
    constructor(public items: ContextMenuItem[]) {
    }

    /**
     * Create a new context menu from the previous that will pass the given args to the click function.
     * @example
     *
     * const menu = new ContextMenu([new ContextMenuItem("Delete", (id) => console.log("Delete", id))])
     *
     * // If click on menu item delete now the id will be undefined.
     * const menuWithArgs = menu.withArgs("pool-1");
     *
     * // Now when clicking on the delete item the callback will have id as "pool-1".
     *
     */
    public withArgs(...args: any[]) {
        return new ContextMenu(this.items.map(item => item.withArgs(...args)));
    }
}

interface ContextMenuItemConfig {
    label: string;
    click: (...args) => void;
    enabled?: boolean;
}

export class ContextMenuItem {
    public id: string;
    public label: string;
    public callbackArgs: any[] = [];
    public enabled: boolean = true;
    private _click: (...args) => void;

    constructor(config: ContextMenuItemConfig);
    constructor(label: string, click: (...args) => void);
    constructor(labelOrConfig: string | ContextMenuItemConfig, click?: (...args) => void) {
        this.id = SecureUtils.uuid();
        if (typeof (labelOrConfig) === "string") {
            this.label = labelOrConfig;
            this._click = click;
        } else {
            this.label = labelOrConfig.label;
            this._click = labelOrConfig.click;
            if (exists(labelOrConfig.enabled)) {
                this.enabled = labelOrConfig.enabled;
            }
        }
    }

    public click() {
        this._click(...this.callbackArgs);
    }

    public withArgs(...args): ContextMenuItem {
        const clone = new ContextMenuItem({
            label: this.label,
            click: this._click,
        });
        clone.callbackArgs = args;
        return clone;
    }
}
