// tslint:disable
declare namespace jasmine {
    interface Matchers {
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
