import { Connector } from "./connector";
import { Filter } from "./filter";
import { Property } from "./property";

export class FilterBuilder {
    public static prop(name: string): Property {
        return new Property(name);
    }

    public static and(...args: Filter[]): Filter {
        return new Filter(Connector.and, args);
    }

    public static or(...args: Filter[]): Filter {
        return new Filter(Connector.or, args);
    }
    public static none(): Filter {
        return new Filter();
    }
}

export function prop(name: string): Property {
    return FilterBuilder.prop(name);
}

export function and(...args: Filter[]): Filter {
    return FilterBuilder.and(...args);
}

export function or(...args: Filter[]): Filter {
    return FilterBuilder.or(...args);
}

export function none(): Filter {
    return FilterBuilder.none();
}
