import { KeyNavigableListItem } from "@batch-flask/core";

export interface AbstractListItem extends KeyNavigableListItem {
    id: string;
    routerLink?: any[];
    disabled: false;
}
