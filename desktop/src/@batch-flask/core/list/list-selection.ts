export interface ListSelectionAttributes {
    all?: boolean;

    /**
     * List of keys selected
     */
    keys?: string[];
}

export class ListSelection {
    public all: boolean = false;
    public keys = new Set<string>();

    constructor(selection?: ListSelection | ListSelectionAttributes) {
        if (!selection) { return; }
        this.all = selection.all || false;

        if (selection instanceof ListSelection) {
            this.keys = selection.keys;
        } else {
            this.keys = new Set<string>(selection.keys);
        }
    }

    public has(key: string) {
        return this.all || this.keys.has(key);
    }

    public add(key: string) {
        return this.keys.add(key);
    }

    public delete(key: string) {
        return this.keys.delete(key);
    }

    public toggle(key: string) {
        if (this.all) { return; }
        if (this.keys.has(key)) {
            this.keys.delete(key);
        } else {
            this.keys.add(key);
        }
    }

    public select(key: string, isSelected: boolean) {
        if (this.all) { return; }

        if (isSelected) {
            this.keys.add(key);
        } else {
            this.keys.delete(key);
        }
    }

    public clear() {
        this.all = false;
        this.keys.clear();
    }

    public isEmpty() {
        return !this.all && this.keys.size === 0;
    }

    public hasAny() {
        return this.all || this.keys.size > 0;
    }

    public hasMultiple() {
        return this.all || this.keys.size > 1;
    }

    public first() {
        return this.keys.values().next().value;
    }

    public asJS() {
        return [...this.keys];
    }
}
