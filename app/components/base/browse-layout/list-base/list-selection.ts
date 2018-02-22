export interface ListSelectionAttributes {
    all: boolean;

    /**
     * List of keys selected
    */
    keys: string[];
}

export class ListSelection {
    public all: boolean;
    public keys = new Set();
    constructor(selection?: ListSelection | ListSelectionAttributes) {
        this.all = selection.all || false;

        if (selection instanceof ListSelection) {
            this.keys = selection.keys;
        } else {
            this.keys = new Set(selection.keys);
        }
    }
}
