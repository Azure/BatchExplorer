import { Connector } from "./connector";
import formats from "./formats";

export class Filter {
    public properties: Filter[];
    public connector: Connector;

    constructor(connector: Connector = Connector.and, properties: Filter[] = []) {
        this.properties = properties.filter((x) => x && !x.isEmpty());
        this.connector = connector;
    }

    public toOData(): string {
        return formats.filter.format(this.properties.map(x => x.toOData()).join(` ${this.connector.id} `));
    }

    public clone(): Filter {
        return new Filter(this.connector, this.properties);
    }

    public isEmpty() {
        return this.properties.length === 0;
    }
}
