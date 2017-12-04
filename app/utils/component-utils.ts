import { SimpleChange } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { ListView } from "app/services/core";

export class ComponentUtils {
    /**
     * Return true if the record changed id
     * @param change Simple change from ngOnChanges
     */
    public static recordChangedId(change: SimpleChange): boolean {
        if (!change) { return false; }
        const { previousValue, currentValue } = change;
        const same = previousValue && currentValue && previousValue.id === currentValue.id;
        return !same;
    }

    public static setActiveItem<TEntity>(route: ActivatedRoute, view: ListView<TEntity, any>): Subscription {
        return route.firstChild.params.subscribe((params) => {
            const key = params[view.getCache(params).uniqueField];
            if (key) {
                view.setFixedKeys([key]);
            } else {
                view.setFixedKeys([]);
            }
        });
    }
}
