import { SanitizedError } from "@batch-flask/utils";
import { Duration } from "moment";
import { RecordMissingExtendsError } from "./errors";
import { setProp, updateTypeMetadata } from "./helpers";
import { Record } from "./record";

// tslint:disable:only-arrow-functions

/**
 * Model attribute decorator.
 *
 * @example
 * ```ts
 * @Prop
 * public foo: string = "default";
 *
 * @Prop
 * public bar:string; // Default will be null
 * ```
 */
export function Prop<T>(type?: any, transform?: (value: any) => any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        if (!type) {
            type = Reflect.getMetadata("design:type", target, attr);
        }
        if (!type) {
            throw new SanitizedError(`Cannot retrieve the type for RecordAttribute ${target.constructor.name}#${attr}`
                + ". Check your nested type is defined in another file or above this DtoAttr");
        }
        updateTypeMetadata(ctr, attr, { type, list: false, transform });
        if (descriptor) {
            descriptor.writable = false;
        } else {
            setProp(ctr, attr);
        }
    };
}

/**
 * Model list attribute decorator. Use this if the attribute is an array
 *
 * @example
 * ```ts
 * @ListProp(Bar)
 * public foos: List<Bar> = List([]);
 * ```
 */
export function ListProp<T>(type: any) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        updateTypeMetadata(ctr, attr, { type, list: true });

        if (descriptor) {
            descriptor.writable = false;
        } else {
            setProp(ctr, attr);
        }
    };
}

export function Model() {
    return <T extends new(...args: any[]) => {}>(ctr: T) => {
        if (!(ctr.prototype instanceof Record)) {
            throw new RecordMissingExtendsError(ctr);
        }

        return (class extends ctr {
            constructor(...args: any[]) {
                const [data] = args;
                if (data instanceof ctr) {
                    return data;
                }
                super(...args);
                (this as any)._completeInitialization();
            }
        });
    };
}

/**
 * The value of unlimited maxWallClockTime/retentionTime threshold
 */
export const UNLIMITED_DURATION_THRESHOLD = 365;

/**
 * The function that converts duration to unlimited when current duration is greater than UNLIMITED_DURATION_THRESHOLD
 * in both mutator and accessor of maxWallClockTime/retentionTime.
 * @param duration
 */
export function TransformDuration(duration: Duration) {
    return (duration && duration.asDays() < UNLIMITED_DURATION_THRESHOLD) ? duration : null;
}
