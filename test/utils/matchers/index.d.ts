// tslint:disable
declare namespace jasmine {
    interface Matchers {
        toBeImmutable(): void;
        toEqualImmutable(expected: any): void;
    }
}
