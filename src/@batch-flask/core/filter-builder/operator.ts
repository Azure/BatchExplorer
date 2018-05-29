import formats from "./formats";

export class Operator {
    public static equal = new Operator("eq", "=", formats.eq);
    public static greaterOrEqual = new Operator("ge", ">=", formats.ge);
    public static greaterThan = new Operator("gt", ">", formats.gt);
    public static lessOrEqual = new Operator("le", "<=", formats.le);
    public static lessThan = new Operator("lt", "<", formats.lt);
    public static notEqual = new Operator("ne", "!=", formats.ne);
    public static startswith = new Operator("startswith", "Start with", formats.startswith);

    public id: string;
    public name: string;
    public format: string;

    constructor(id: string, name: string, format: string) {
        this.id = id;
        this.name = name;
        this.format = format;
    }
}
