import { SimpleChange } from "@angular/core";

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
}
