import { SimpleChange } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

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

    /**
     * This will use the current route to find which item is currently being browsed if any
     * and update the listView to mark this item as always present in the list as long as its being browsed.
     * It use the ListView#setFixedKeys() method.
     *
     * @example ListView contains 3 pools with id pool-1, pool-2 and pool-3.
     * Now you are navigating to /pools/pool-4. This will make sure the list shows pool-4 at the begnining too
     * Now you navigate back to /pool/pool-2. As pool-4 wasn't present originally it will be removed from the list
     *
     * @param route Angular Activated Route
     * @param view ListView used in the componenent
     */
    public static setActiveItem<TEntity>(route: ActivatedRoute, view: ListView<TEntity, any>) {
        route.url.subscribe((url) => {
            const child = route.snapshot.firstChild;
            if (child) {
                const params = child.params;
                const key = params[view.getCache(params).uniqueField];
                if (key) {
                    view.setFixedKeys([key]);
                    return;
                }
            }
            view.setFixedKeys([]);
        });
    }

    public static coerceBooleanProperty(value: boolean | undefined | null): boolean {
        return value != null && `${value}` !== "false";
    }
}
