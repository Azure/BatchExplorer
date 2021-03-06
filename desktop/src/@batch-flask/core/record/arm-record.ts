import { Model, Prop } from "./decorators";
import { Record } from "./record";

export interface ArmRecordAttributes {
    id: string;
    type?: string;
}

/**
 * ArmRecord is a subclass of record that unify the id for ARM record which have problems with the case.
 */
@Model()
export class ArmRecord<T extends ArmRecordAttributes> extends Record<T> {
    @Prop() public type: string;

    constructor(data: Partial<T>) {
        super({ ...data as any, id: data.id && data.id.toLowerCase() });
    }
}
