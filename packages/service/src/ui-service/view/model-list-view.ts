import { action, computed, IObservableArray, observable } from "mobx";
import { View } from "./view";

export interface ModelListView<S, T> extends View {
    readonly service: S;
    readonly items: IObservableArray<T>;
    length: number;
    update(items: T[]): void;
}

export interface SelectableListView<T> {
    readonly selectedItems: IObservableArray<T>;
    selectByIndex(index: number): void;
    clearSelection(): void;
}

export abstract class AbstractModelListView<S, T>
    implements ModelListView<S, T> {
    readonly service: S;

    @observable items: IObservableArray<T>;
    @observable loading: boolean;

    @computed
    get length(): number {
        return this.items.length;
    }

    constructor(service: S, items: T[] = []) {
        this.service = service;
        this.items = observable([]);
        this.loading = false;
        this.update(items);
    }

    @action
    clear(): void {
        this.items.clear();
    }

    abstract update(items: T[]): void;
}
