/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form } from "./form";
import { FormEntry } from "./form-entry";

/**
 * Centralizes logic behind a single form, and stores all parameter values in
 * one place.
 */
export class FormController {
    private _form: Form;
    private _value: any = {};
    private _entriesInitialized = false;
    private _registry: FormControllerRegistry;

    /**
     * An map containing all of the values in the form and all subforms in
     * a single tree structure. Each key in this map is either a parameter ID,
     * or a subform ID.
     */
    get value(): any {
        return this._value;
    }

    constructor(form: Form) {
        this._form = form;
        this._registry = new FormControllerRegistry(form);
    }

    /**
     * Look up a form entry by absolute path
     *
     * @param path  Absolute path of the form entry
     * @returns     An entry if found, otherwise null
     */
    lookup(path: string): FormEntry | null {
        return this._registry.lookup(path);
    }

    /**
     * Look up a form entry by absolute path
     *
     * @param path  Absolute path of the form entry
     * @returns     An entry if found, otherwise null
     */
    lookupParent(path: string): FormEntry | null {
        const node = this._registry.lookupNode(path);
        if (node && node.parent) {
            return node.parent;
        }
        return null;
    }

    /**
     * Look up any *direct* children of a form entry by absolute path
     *
     * @param path  Absolute path of the form entry
     * @returns     A list of child entries which may be empty
     */
    lookupChildren(path: string): FormEntry[] {
        const node = this._registry.lookupNode(path);
        if (node && node.sortedChildren) {
            const children = [];
            for (const n of node.sortedChildren) {
                if (n.entry) {
                    children.push(n.entry);
                }
            }
            return children;
        }
        return [];
    }

    /**
     * Look up a form entry by relative path
     *
     * @param path  Relative path
     * @param id    ID of the entry to look up
     * @returns     An entry if found, otherwise null
     */
    lookupRelative(path: string, id: string): FormEntry | null {
        if (path == null || id == null) {
            return null;
        }
        if (path === "") {
            return this.lookup(id);
        }
        return this.lookup(`${path}.${id}`);
    }

    /**
     * Register a form entry with this controller
     *
     * @param parent    The parent entry which will determine the path
     * @param entry     The entry to register
     * @returns         The path to the newly registered entry
     */
    register(parent: FormEntry, entry: FormEntry): string {
        return this._registry.register(parent, entry);
    }

    getValue(path: string): any {
        if (path === "") {
            return this._value;
        }

        let context = this._value;
        let value: any;
        const parts = path.split(".");
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) {
                value = context[p];
            } else {
                if (!context[p]) {
                    break;
                }
                context = context[p];
            }
        }

        return value;
    }

    updateValue(path: string, value: unknown): void {
        const entry = this.lookup(path);
        if (!entry) {
            console.error(
                `Failed to update value: No entry found at path ${path}`
            );
            return;
        }
        if (!entry.isForm() && !entry.isParameter()) {
            console.error(
                `Failed to update value: Only forms or parameters can have values. Entry at path "${path}" is a ${entry.entryType.toLowerCase()}`
            );
            return;
        }

        let context = this._value;
        const parts = path.split(".") ?? [];
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) {
                context[p] = value;
            } else {
                if (!context[p]) {
                    context[p] = {};
                }
                context = context[p];
            }
        }
    }

    /**
     * Calls initialize() on each entry in the form. This should be called only
     * once after adding all initial entries to the form.
     */
    initializeEntries(): void {
        if (this._entriesInitialized) {
            throw new Error("Controller has already initialized form entries");
        }
        this._registry.forEach((entry) => {
            if (entry !== this._form) {
                entry.initialize();
            }
        });
        this._entriesInitialized = true;
    }
}

type EntryTreeNode = {
    path: string;
    parent: FormEntry | null;
    children: { [id: string]: EntryTreeNode };
    sortedChildren: EntryTreeNode[];
    entry: FormEntry;
};

/**
 * Stores information about the structure of entries in the form,
 * along with easy lookup by path
 */
class FormControllerRegistry {
    private _tree: EntryTreeNode;

    constructor(form: Form) {
        this._tree = {
            path: "",
            parent: null,
            children: {},
            sortedChildren: [],
            entry: form,
        };
    }

    /**
     * Look up entry by absolute path
     *
     * @param path Absolute path of the form entry
     */
    lookup(path: string): FormEntry | null {
        const node = this.lookupNode(path);
        if (node?.entry) {
            return node.entry;
        }
        return null;
    }

    /**
     * Look up a tree node with a corresponding entry by absolute path
     *
     * @param path Absolute path of the form entry
     */
    lookupNode(path: string): EntryTreeNode | null {
        if (path === "") {
            // Root node
            return this._tree;
        }

        let lookedupNode: EntryTreeNode | null = null;
        let currNode = this._tree;
        const pathParts = path.split(".");
        for (let i = 0; i < pathParts.length; i++) {
            const p = pathParts[i];
            const isLast = i === pathParts.length - 1;
            if (!currNode.children[p]) {
                // Not found: hit the end of the tree
                break;
            }

            const nextNode = currNode.children[p];
            if (isLast) {
                if (nextNode.entry) {
                    // Found an entry
                    lookedupNode = nextNode;
                    break;
                } else {
                    // Not found: no entry registered here
                    break;
                }
            }
            currNode = nextNode;
        }
        return lookedupNode;
    }

    /**
     * Register a form entry
     *
     * @param entry The entry to register
     * @returns     The absolute path to the registered entry
     */
    register(parent: FormEntry, entry: FormEntry): string {
        let absolutePath: string;
        if (parent.isForm() && !parent.isSubForm) {
            absolutePath = entry.id;
        } else {
            if (!parent.path) {
                throw new Error(
                    "Parent has no path. This may be the case if it has not been added to a form"
                );
            }
            absolutePath = `${parent.path}.${entry.id}`;
        }

        const pathParts = absolutePath.split(".");

        let currNode = this._tree;
        let nextPath = "";
        for (let i = 0; i < pathParts.length; i++) {
            const p = pathParts[i];
            const isLast = i === pathParts.length - 1;
            nextPath = nextPath === "" ? p : `${nextPath}.${p}`;

            const nextNode = currNode.children[p];
            if (!nextNode) {
                const newNode: EntryTreeNode = {
                    path: nextPath,
                    parent: currNode.entry ?? null,
                    children: {},
                    sortedChildren: [],
                    entry: entry,
                };
                currNode.children[p] = newNode;
                currNode.sortedChildren.push(newNode);
            } else if (isLast) {
                if (nextNode.entry) {
                    throw new Error(
                        `Failed to register entry ${entry.path}: An entry with that path is already registered.`
                    );
                }
                if (currNode.entry) nextNode.entry = entry;
            }
            currNode = nextNode;
        }
        return absolutePath;
    }

    /**
     * Walk the entry tree and execute a callback whenever an entry is found.
     *
     * @param callback The callback to execute for each entry
     */
    forEach(callback: (entry: FormEntry) => void) {
        const walk = (node: EntryTreeNode) => {
            if (node.entry) {
                callback(node.entry);
            }
            if (node.sortedChildren) {
                for (const child of node.sortedChildren) {
                    walk(child);
                }
            }
        };
        walk(this._tree);
    }
}
