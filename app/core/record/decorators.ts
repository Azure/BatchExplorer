import { List } from "immutable";
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
export function Prop<T>(...args) {
    return (target, attr, descriptor?: TypedPropertyDescriptor<T>) => {
        const ctr = target.constructor;
        const type = Reflect.getMetadata("design:type", target, attr);
        if (!type) {
            throw new Error(`Cannot retrieve the type for RecordAttribute ${target.constructor.name}#${attr}`
                + ". Check your nested type is defined in another file or above this DtoAttr");
        }

        updateTypeMetadata(ctr, attr, { type, list: false });
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
    return <T extends { new(...args: any[]): {} }>(ctr: T) => {
        if (!(ctr.prototype instanceof Record)) {
            throw new RecordMissingExtendsError(ctr);
        }
        // // save a reference to the original constructor
        // const original = ctr;

        // // the new constructor behaviour
        // const f: any = function (this: T, data, ...args) {
        //     if (data instanceof ctr) {
        //         return data;
        //     }
        //     const obj = new original(data, ...args) as any;
        //     console.log("origina", original, obj);
        //     obj._completeInitialization();
        //     return obj;
        // };
        // // Copy static methods
        // for (let prop of Object.keys(original)) {
        //     f[prop] = original[prop];
        // }
        // // copy prototype so intanceof operator still works
        // f.prototype = original.prototype;

        // // return new constructor (will override original)
        // return f;
        return ctr;
    };
}
