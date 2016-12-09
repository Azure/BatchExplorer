// tslint:disable
declare namespace jasmine {
    interface Matchers {
        // misc-matchers
        toBeBlank(): void;

        // immutable-matchers
        toBeImmutable(): void;
        toEqualImmutable(expected: any): void;
    }
}
