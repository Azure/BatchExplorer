import { action, computed, observable } from "mobx";
import { View } from "./view";

export interface ModelListView<S, T> extends View {
    readonly service: S;
    readonly items: T[];
    length: number;
}

export interface SelectableListView<T> {
    readonly selectedItems: T[];
    selectByIndex(index: number): void;
    clearSelection(): void;
}

export abstract class AbstractModelListView<S, T>
    implements ModelListView<S, T>
{
    readonly service: S;

    @observable items: T[] = [];
    @observable loading: boolean = false;

    @computed
    get length(): number {
        return this.items.length;
    }

    constructor(service: S, items: T[] = []) {
        this.service = service;
        this.items = items;
    }

    @action
    clear(): void {
        this.items = [];
    }
}
