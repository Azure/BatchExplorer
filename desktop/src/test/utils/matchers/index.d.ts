/* eslint-disable */
declare namespace jasmine {
    interface Matchers<T> {
        // misc-matchers
        toBeBlank(): void;
        toBeVisible(): void;
        toBeHidden(): void;
        toHaveBeenCalledOnce(): void;

        // immutable-matchers
        toBeImmutable(): void;
        toEqualImmutable(expected: any): void;
    }
}
