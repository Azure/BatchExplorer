import { Iterable, is } from "immutable";

function toString(obj) {
    return obj && typeof obj.toString === "function" ? obj.toString() : obj;
}

function toBeImmutable() {
    return {
        compare: (actual, expected) => {
            return { pass: Iterable.isIterable(actual) };
        },
    };
}

function toEqualImmutable() {
    return {
        compare: (actual, expected) => {
            return {
                pass: is(actual, expected),
                message: `Expected ${toString(actual)} to equal ${toString(expected)}`,
            };
        },
    };
}

export const matchers = {
    toBeImmutable,
    toEqualImmutable,
};
