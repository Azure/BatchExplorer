import { Connector } from "./connector";
import { Filter } from "./filter";
import { Operator } from "./operator";
import { Property } from "./property";

export type MatchingFunction<T> = (item: T, value: any, operator: Operator) => boolean;

export class FilterMatcher<T> {
    public test(filter: Filter, item: T) {
        if (filter instanceof Property) {
            return this.testProperty(filter as Property, item);
        }
        if (filter.connector === Connector.and) {
            for (const subfilter of filter.properties) {
                if (!this.test(subfilter, item)) {
                    return false;
                }
            }
            return true;
        } else {
            for (const subfilter of filter.properties) {
                if (this.test(subfilter, item)) {
                    return true;
                }
            }
            return false;
        }
    }

    public testProperty(property: Property, item: T) {
        const value = this.getPropertyValue(property, item);
        if (!value) { return true; }
        if (typeof value === "string") {
            return this.testString(property.operator, value, property.value);
        } else {
            // TODO-TIM
            return true;
        }
    }

    public testString(operator: Operator, value: string, test: string) {
        switch (operator) {
            case Operator.equal:
                return value === test;
            case Operator.notEqual:
                return value !== test;
            case Operator.greaterOrEqual:
                return value >= test;
            case Operator.greaterThan:
                return value > test;
            case Operator.lessOrEqual:
                return value <= test;
            case Operator.lessThan:
                return value < test;
            case Operator.startswith:
                return value.startsWith(test);
            default:
                return true;
        }
    }
    public getPropertyValue(property: Property, item: T) {
        const path = property.name.split("/");
        let value = item;

        for (const segment of path) {
            if (segment in value) {
                value = value[segment];
            } else {
                return null;
            }
        }
        return value;
    }
}
