import { List, Record } from "immutable";

//  tslint:disable:variable-name
const ResizeErrorRecord = Record({
    code: null,
    message: null,
    vals: [],
});

export class ResizeError extends ResizeErrorRecord {
    public code: string;

    public message: string;

    // Equivalent to the values in the API as values is already used in immutable
    public vals: List<any>;

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            vals: List(data.values),
        }));
    }
}
