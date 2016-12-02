import * as immutableMatchers from "./immutable-matchers";

beforeEach(() => {
    jasmine.addMatchers(immutableMatchers.matchers);
});
