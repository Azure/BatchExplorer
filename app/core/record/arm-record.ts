import { Record } from "./record";

export interface ArmRecordAttributes {
    id: string;
}

/**
 * ArmRecord is a subclass of record that unify the id for ARM record which have problems with the case.
 */
export class ArmRecord<T extends ArmRecordAttributes> extends Record<T> {
    constructor(data: T) {
        super(Object.assign({}, data, { id: data.id && data.id.toLowerCase() }));
    }
}
