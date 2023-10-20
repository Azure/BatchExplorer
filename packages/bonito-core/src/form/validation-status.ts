/**
 * Represents the result of a given validation
 * VD default to any, to have better type compatibility as it
 * can be initialized with without a data object and assigned
 * to a ValidationSnapshot with a data type.
 */
export class ValidationStatus<VD extends undefined | any = any> {
    forced?: boolean = false;

    constructor(
        public level: "ok" | "warn" | "error" | "canceled",
        public message?: string,
        public data?: VD
    ) {}
}

// class A<T> {
//     data?: T;
// }

// declare let a1: A<undefined | string>;

// declare let a2: A<string>;

// declare let b1: undefined | string;

// declare let b2: unknown;

// a1 = a2;
// a1 = a2;

// b2 = b1;
// b2 = b1;
// // b1 = b2;
// // b1 = b2;

// function fun1<A, B, C>(
//     param: { a?: A; b?: B; c?: C },
//     callback?: (data: { a?: A; b?: B; c?: C }) => void
// ) {
//     console.log(param, callback);
// }

// function callback(a: 1, b: 2, c:3) {
//     console.log(a, b, c);
// }

// fun1({a:2, b:3, c:4}, callback)
