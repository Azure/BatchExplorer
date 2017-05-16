import { log } from "app/utils";
import { Connector } from "./connector";
import { Filter } from "./filter";
import { Operator } from "./operator";
import { Property } from "./property";

export type MatchingFunction<T> = (item: T, value: any, operator: Operator) => boolean;

export class FilterMatcher<T> {
    constructor(private _matchers: StringMap<MatchingFunction<T>>) {
    }

    public test(filter: Filter, item: T) {
        if (filter instanceof Property) {
            const property = filter as Property;
            if (property.name in this._matchers) {
                return this._matchers[property.name](item, property.value, property.operator);
            } else {
                log.error(`Cannot find matcher for property with name "${property.name}!"`,
                    { matchers: this._matchers });
                return true;
            }
        }
        if (filter.connector === Connector.and) {
            for (let subfilter of filter.properties) {
                if (!this.test(subfilter, item)) {
                    return false;
                }
            }
            return true;
        } else {
            for (let subfilter of filter.properties) {
                if (this.test(subfilter, item)) {
                    return true;
                }
            }
            return false;
        }
    }
}
