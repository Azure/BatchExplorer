/**
 * Execption to be thrown if the user created a model with the @Model decorator but forgot to extend the Record class.
 */
export class RecordMissingExtendsError extends Error {
    constructor(ctr: Function) {
        super(`Class ${ctr.name} with the @Model Decorator should also extends the Record class`);
        this.name = "RecordMissingExtendsError";
    }
}

/**
 * Execption to be thrown if the user tries to call setter of attribute.
 */
export class RecordSetAttributeError extends Error {
    constructor(ctr: Function, attr: string) {
        super(`Cannot set attribute ${attr} of immutable Record ${ctr.name}!`);
        this.name = "RecordSetAttributeError";
    }
}
