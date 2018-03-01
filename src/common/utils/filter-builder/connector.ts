
export class Connector {
    public static and = new Connector("and", "And");
    public static or = new Connector("or", "Or");

    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
